"""Deterministic uncertainty scoring and human-review queue selection."""

from __future__ import annotations

from math import ceil
from typing import Any, Iterable, Mapping

REVIEW_FRACTION = 0.20


def review_priority_score(probability: float) -> float:
    """Score uncertainty from 0 (certain) to 1 (decision boundary)."""
    if not 0 <= probability <= 1:
        raise ValueError("prediction probability must be between 0 and 1")
    return 1 - abs(2 * probability - 1)


def add_review_priority(
    predictions: Iterable[Mapping[str, Any]],
) -> list[dict[str, Any]]:
    """Attach a deterministic review score to every prediction row."""
    scored: list[dict[str, Any]] = []
    for prediction in predictions:
        if "evaluation_id" not in prediction:
            raise ValueError("prediction row is missing evaluation_id")
        if "prediction_probability" not in prediction:
            raise ValueError("prediction row is missing prediction_probability")
        row = dict(prediction)
        row["review_priority_score"] = review_priority_score(
            float(row["prediction_probability"])
        )
        scored.append(row)
    return scored


def select_review_queue(
    predictions: Iterable[Mapping[str, Any]],
    review_fraction: float = REVIEW_FRACTION,
) -> list[dict[str, Any]]:
    """Select exactly ceil(review_fraction * N) rows with deterministic ties."""
    if not 0 < review_fraction <= 1:
        raise ValueError("review_fraction must be greater than 0 and at most 1")

    scored = add_review_priority(predictions)
    budget = ceil(review_fraction * len(scored))
    ranked = sorted(
        scored,
        key=lambda row: (-float(row["review_priority_score"]), str(row["evaluation_id"])),
    )
    return ranked[:budget]
