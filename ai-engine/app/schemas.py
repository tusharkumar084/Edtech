"""Typed API schemas for the isolated ED-04 service."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class PredictionInput(BaseModel):
    evaluation_id: str = Field(min_length=1)
    features: dict[str, Any]


class PredictionResult(BaseModel):
    evaluation_id: str
    prediction_probability: float
    prediction: int
    review_priority_score: float


class PredictRequest(BaseModel):
    rows: list[PredictionInput] = Field(min_length=1)


class PredictResponse(BaseModel):
    predictions: list[PredictionResult]


class TrainRequest(BaseModel):
    dataset_path: str | None = None
    model_path: str | None = None


class TrainResponse(BaseModel):
    status: str
    metrics: dict[str, Any]


class ReviewRequest(BaseModel):
    evaluation_id: str = Field(min_length=1)
    human_decision: int = Field(ge=0, le=1)
    reviewer: str = Field(min_length=1)
    override_reason: str | None = None


class ReviewResponse(BaseModel):
    status: str
    review: dict[str, Any]
