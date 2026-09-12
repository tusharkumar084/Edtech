"""FastAPI entry point for the isolated TimeOut ED-04 AI service."""

from __future__ import annotations

from datetime import datetime, timezone
import json
import os
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .metrics import calculate_fairness, calculate_metrics
from .model import (
    MODEL_FEATURES,
    TrainedModel,
    load_dataset,
    load_model,
    explain_prediction,
    predict as model_predict,
    save_model,
    train_model,
)
from .review_queue import add_review_priority, select_review_queue
from .schemas import (
    PredictRequest,
    PredictResponse,
    PredictionResult,
    ReviewRequest,
    ReviewResponse,
    TrainRequest,
    TrainResponse,
)

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATASET_PATH = ROOT / "data" / "student-mat.csv"
DEFAULT_MODEL_PATH = ROOT / "models" / "model.joblib"
DEFAULT_REVIEW_HISTORY_PATH = ROOT / "runtime" / "review-history.json"
REVIEW_HISTORY_PATH = Path(os.getenv("REVIEW_HISTORY_PATH", DEFAULT_REVIEW_HISTORY_PATH))

app = FastAPI(title="TimeOut ED-04 AI Engine", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_model: TrainedModel | None = None
_model_metrics: dict[str, Any] = {}
_predictions: list[dict[str, Any]] = []
def _load_reviews() -> list[dict[str, Any]]:
    if not REVIEW_HISTORY_PATH.is_file():
        return []
    try:
        data = json.loads(REVIEW_HISTORY_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []
    return data if isinstance(data, list) else []


def _save_reviews() -> None:
    REVIEW_HISTORY_PATH.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = REVIEW_HISTORY_PATH.with_suffix(".tmp")
    temporary_path.write_text(json.dumps(_reviews, indent=2), encoding="utf-8")
    temporary_path.replace(REVIEW_HISTORY_PATH)


_reviews: list[dict[str, Any]] = _load_reviews()
_evaluation_features: dict[str, dict[str, Any]] = {}


def _populate_development_evaluation(frame: Any, model: TrainedModel) -> None:
    global _predictions, _evaluation_features
    development_predictions = model_predict(
        model,
        frame[MODEL_FEATURES].to_dict(orient="records"),
    )
    _predictions = add_review_priority([
        {
            "evaluation_id": f"student-{index + 1:04d}",
            "target": int(frame.iloc[index]["G3"] < 10),
            "sex": str(frame.iloc[index]["sex"]),
            "school": str(frame.iloc[index]["school"]),
            **prediction,
        }
        for index, prediction in enumerate(development_predictions)
    ])
    _evaluation_features = {
        f"student-{index + 1:04d}": row
        for index, row in enumerate(frame[MODEL_FEATURES].to_dict(orient="records"))
    }


def _restore_saved_model() -> None:
    global _model
    if not DEFAULT_MODEL_PATH.is_file() or not DEFAULT_DATASET_PATH.is_file():
        return
    try:
        _model = load_model(DEFAULT_MODEL_PATH)
        _populate_development_evaluation(load_dataset(DEFAULT_DATASET_PATH), _model)
    except (OSError, ValueError):
        _model = None


def _require_model() -> TrainedModel:
    if _model is None:
        raise HTTPException(status_code=503, detail="Model is not trained")
    return _model


def _train(dataset_path: Path, model_path: Path) -> dict[str, Any]:
    global _model, _model_metrics, _predictions, _reviews, _evaluation_features
    try:
        frame = load_dataset(dataset_path)
        _model, _model_metrics = train_model(frame)
        save_model(_model, model_path)
        _populate_development_evaluation(frame, _model)
        _reviews = []
        _save_reviews()
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    return _model_metrics


@app.get("/health")
def health() -> dict[str, Any]:
    return {"status": "healthy", "model_trained": _model is not None}


@app.post("/train", response_model=TrainResponse)
def train(request: TrainRequest | None = None) -> TrainResponse:
    request = request or TrainRequest()
    metrics = _train(
        Path(request.dataset_path) if request.dataset_path else DEFAULT_DATASET_PATH,
        Path(request.model_path) if request.model_path else DEFAULT_MODEL_PATH,
    )
    return TrainResponse(status="trained", metrics=metrics)


@app.post("/predict", response_model=PredictResponse)
def predict(request: PredictRequest) -> PredictResponse:
    model = _require_model()
    try:
        raw_predictions = model_predict(
            model,
            [row.features for row in request.rows],
        )
        scored = add_review_priority([
            {"evaluation_id": row.evaluation_id, **result}
            for row, result in zip(request.rows, raw_predictions)
        ])
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

    _predictions.clear()
    _predictions.extend(scored)
    return PredictResponse(
        predictions=[PredictionResult(**row) for row in scored]
    )


@app.get("/review-queue", response_model=list[PredictionResult])
def review_queue() -> list[PredictionResult]:
    _require_model()
    return [PredictionResult(**row) for row in select_review_queue(_predictions)]


@app.get("/student/{evaluation_id}", response_model=PredictionResult)
def student(evaluation_id: str) -> PredictionResult:
    _require_model()
    for row in _predictions:
        if row["evaluation_id"] == evaluation_id:
            return PredictionResult(**row)
    raise HTTPException(status_code=404, detail="Evaluation ID not found")


@app.get("/student/{evaluation_id}/explanation")
def student_explanation(evaluation_id: str) -> dict[str, Any]:
    model = _require_model()
    for row in _predictions:
        if row["evaluation_id"] == evaluation_id:
            try:
                feature_row = _evaluation_features[evaluation_id]
                priority = next(
                    item["review_priority_score"]
                    for item in _predictions
                    if item["evaluation_id"] == evaluation_id
                )
                return {
                    "evaluation_id": evaluation_id,
                    "reason": "Prediction is close to the decision boundary." if priority >= 0.8 else "Prediction has comparatively higher uncertainty than other evaluated rows.",
                    "contributions": explain_prediction(model, feature_row),
                }
            except ValueError as error:
                raise HTTPException(status_code=422, detail=str(error)) from error
    raise HTTPException(status_code=404, detail="Evaluation ID not found")


@app.get("/metrics")
def metrics() -> dict[str, Any]:
    _require_model()
    if not _predictions or any("target" not in row for row in _predictions):
        raise HTTPException(
            status_code=409,
            detail="Benchmark metrics require a labeled evaluation set; prediction labels are not accepted here",
        )
    reviewed_ids = [review["evaluation_id"] for review in _reviews]
    return calculate_metrics(_predictions, reviewed_ids)


@app.get("/fairness")
def fairness() -> dict[str, Any]:
    _require_model()
    if not _predictions or any(
        key not in row for row in _predictions for key in ("target", "sex", "school")
    ):
        raise HTTPException(
            status_code=409,
            detail="Benchmark fairness requires a labeled evaluation set with sex and school attributes",
        )
    reviewed_ids = [review["evaluation_id"] for review in _reviews]
    try:
        return calculate_fairness(_predictions, reviewed_ids)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@app.get("/model-performance")
def model_performance() -> dict[str, Any]:
    _require_model()
    return {**_model_metrics, **metrics()}


@app.post("/review", response_model=ReviewResponse)
def review(request: ReviewRequest) -> ReviewResponse:
    _require_model()
    prediction = next(
        (row for row in _predictions if row["evaluation_id"] == request.evaluation_id),
        None,
    )
    if prediction is None:
        raise HTTPException(status_code=404, detail="Evaluation ID not found")

    record = {
        "evaluation_id": request.evaluation_id,
        "ai_prediction": prediction["prediction"],
        "ai_probability": prediction["prediction_probability"],
        "review_priority_score": prediction["review_priority_score"],
        "human_decision": request.human_decision,
        "reviewer": request.reviewer,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "override_reason": request.override_reason,
    }
    _reviews[:] = [
        existing for existing in _reviews
        if existing["evaluation_id"] != request.evaluation_id
    ]
    _reviews.append(record)
    _save_reviews()
    return ReviewResponse(status="reviewed", review=record)


@app.get("/review-history", response_model=list[dict[str, Any]])
def review_history() -> list[dict[str, Any]]:
    _require_model()
    return list(_reviews)


_restore_saved_model()
