"""Deterministic, leakage-safe model training for the ED-04 demo."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping, Sequence

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

RANDOM_STATE = 42
TARGET_COLUMN = "support_needed"
DEVELOPMENT_LABEL_COLUMN = "G3"
DEFAULT_THRESHOLD = 0.5

NUMERIC_FEATURES = [
    "age", "Medu", "Fedu", "traveltime", "studytime", "failures",
    "famrel", "freetime", "goout", "Dalc", "Walc", "health", "absences",
    "G1", "G2",
]
CATEGORICAL_FEATURES = [
    "school", "sex", "address", "famsize", "Pstatus", "Mjob", "Fjob",
    "reason", "guardian", "schoolsup", "famsup", "paid", "activities",
    "nursery", "higher", "internet", "romantic",
]
MODEL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


@dataclass
class TrainedModel:
    pipeline: Pipeline
    feature_names: list[str]
    threshold: float = DEFAULT_THRESHOLD
    random_state: int = RANDOM_STATE


def load_dataset(path: str | Path) -> pd.DataFrame:
    """Load the semicolon-delimited UCI mathematics dataset."""
    dataset_path = Path(path)
    if not dataset_path.is_file():
        raise FileNotFoundError(
            f"Dataset not found at {dataset_path}. Place student-mat.csv in ai-engine/data."
        )

    frame = pd.read_csv(dataset_path, sep=";")
    required = set(MODEL_FEATURES) | {DEVELOPMENT_LABEL_COLUMN}
    missing = sorted(required.difference(frame.columns))
    if missing:
        raise ValueError(f"Dataset is missing required columns: {', '.join(missing)}")
    if frame.empty:
        raise ValueError("Dataset contains no rows")
    return frame


def prepare_training_data(frame: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    """Create the development target while keeping G3 outside model inputs."""
    if DEVELOPMENT_LABEL_COLUMN not in frame.columns:
        raise ValueError("Dataset must contain G3 to derive the development target")

    features = frame[MODEL_FEATURES].copy()
    target = (pd.to_numeric(frame[DEVELOPMENT_LABEL_COLUMN], errors="raise") < 10).astype(int)
    return features, target


def build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "numeric",
                Pipeline([("scale", StandardScaler())]),
                NUMERIC_FEATURES,
            ),
            (
                "categorical",
                OneHotEncoder(handle_unknown="ignore"),
                CATEGORICAL_FEATURES,
            ),
        ],
        remainder="drop",
    )
    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", LogisticRegression(max_iter=2000, random_state=RANDOM_STATE)),
        ]
    )


def train_model(frame: pd.DataFrame) -> tuple[TrainedModel, dict[str, Any]]:
    features, target = prepare_training_data(frame)
    if target.nunique() < 2:
        raise ValueError("Training data must contain both support-needed classes")

    train_features, validation_features, train_target, validation_target = train_test_split(
        features,
        target,
        test_size=0.2,
        random_state=RANDOM_STATE,
        stratify=target,
    )
    pipeline = build_pipeline()
    pipeline.fit(train_features, train_target)
    validation_predictions = pipeline.predict(validation_features)

    model = TrainedModel(pipeline=pipeline, feature_names=MODEL_FEATURES.copy())
    metrics = {
        "training_rows": int(len(train_features)),
        "validation_rows": int(len(validation_features)),
        "validation_accuracy": float(accuracy_score(validation_target, validation_predictions)),
        "feature_names": MODEL_FEATURES.copy(),
        "target_definition": "support_needed = 1 when G3 < 10",
        "excluded_columns": [DEVELOPMENT_LABEL_COLUMN],
        "random_state": RANDOM_STATE,
    }
    return model, metrics


def save_model(model: TrainedModel, path: str | Path) -> None:
    output_path = Path(path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, output_path)


def load_model(path: str | Path) -> TrainedModel:
    model_path = Path(path)
    if not model_path.is_file():
        raise FileNotFoundError(f"Trained model not found at {model_path}")
    model = joblib.load(model_path)
    if not isinstance(model, TrainedModel):
        raise ValueError("Model artifact has an unsupported format")
    return model


def predict(model: TrainedModel, rows: Sequence[Mapping[str, Any]]) -> list[dict[str, Any]]:
    """Return probabilities and thresholded predictions without requiring labels."""
    if not rows:
        return []
    features = pd.DataFrame(rows)
    missing = sorted(set(MODEL_FEATURES).difference(features.columns))
    if missing:
        raise ValueError(f"Prediction rows are missing required features: {', '.join(missing)}")

    probabilities = model.pipeline.predict_proba(features[MODEL_FEATURES])[:, 1]
    return [
        {
            "prediction_probability": float(probability),
            "prediction": int(probability >= model.threshold),
        }
        for probability in probabilities
    ]


def explain_prediction(model: TrainedModel, row: Mapping[str, Any], limit: int = 5) -> list[dict[str, Any]]:
    """Return the largest signed logistic-regression feature contributions."""
    features = pd.DataFrame([row])
    missing = sorted(set(MODEL_FEATURES).difference(features.columns))
    if missing:
        raise ValueError(f"Explanation row is missing required features: {', '.join(missing)}")

    pipeline = model.pipeline
    transformed = pipeline.named_steps["preprocessor"].transform(features[MODEL_FEATURES])
    classifier = pipeline.named_steps["classifier"]
    names = pipeline.named_steps["preprocessor"].get_feature_names_out()
    values = transformed.toarray()[0] if hasattr(transformed, "toarray") else transformed[0]
    contributions = values * classifier.coef_[0]
    ranked = sorted(
        zip(names, contributions),
        key=lambda item: abs(float(item[1])),
        reverse=True,
    )[:limit]
    return [
        {
            "feature": str(name).replace("numeric__", "").replace("categorical__", ""),
            "contribution": float(contribution),
            "direction": "support_needed" if contribution > 0 else "no_support_signal",
        }
        for name, contribution in ranked
    ]


def train_from_csv(dataset_path: str | Path, model_path: str | Path) -> dict[str, Any]:
    frame = load_dataset(dataset_path)
    model, metrics = train_model(frame)
    save_model(model, model_path)
    return metrics
