"""Evaluation, calibration, review-efficiency, and fairness metrics."""

from __future__ import annotations

from itertools import combinations
from math import ceil
from typing import Any, Iterable, Mapping, Sequence


def _rows(rows: Iterable[Mapping[str, Any]]) -> list[dict[str, Any]]:
    return [dict(row) for row in rows]


def _require(row: Mapping[str, Any], *keys: str) -> None:
    missing = [key for key in keys if key not in row]
    if missing:
        raise ValueError(f"evaluation row is missing required fields: {', '.join(missing)}")


def _accuracy(predictions: Sequence[int], targets: Sequence[int]) -> float:
    if not targets:
        return 0.0
    return sum(prediction == target for prediction, target in zip(predictions, targets)) / len(targets)


def calculate_metrics(
    evaluation_rows: Iterable[Mapping[str, Any]],
    reviewed_ids: Iterable[str],
) -> dict[str, Any]:
    """Calculate benchmark metrics without exposing targets to prediction callers."""
    rows = _rows(evaluation_rows)
    reviewed = {str(identifier) for identifier in reviewed_ids}
    for row in rows:
        _require(row, "evaluation_id", "prediction", "prediction_probability", "target")

    targets = [int(row["target"]) for row in rows]
    predictions = [int(row["prediction"]) for row in rows]
    after_predictions = [
        int(row["target"]) if str(row["evaluation_id"]) in reviewed else int(row["prediction"])
        for row in rows
    ]
    original_errors = [
        row for row in rows if int(row["prediction"]) != int(row["target"])
    ]
    reviewed_errors = [
        row for row in original_errors if str(row["evaluation_id"]) in reviewed
    ]
    budget = ceil(0.20 * len(rows))
    brier_score = (
        sum((float(row["prediction_probability"]) - int(row["target"])) ** 2 for row in rows) / len(rows)
        if rows
        else 0.0
    )

    return {
        "evaluation_size": len(rows),
        "review_budget": budget,
        "before_review_accuracy": _accuracy(predictions, targets),
        "after_review_accuracy": _accuracy(after_predictions, targets),
        "review_efficiency": len(reviewed_errors) / budget if budget else 0.0,
        "brier_score": brier_score,
        "calibration_utility": 1 - brier_score,
        "original_model_errors": len(original_errors),
        "reviewed_model_errors": len(reviewed_errors),
    }


def _group_stats(rows: Sequence[Mapping[str, Any]], attribute: str) -> list[dict[str, Any]]:
    groups = sorted({str(row[attribute]) for row in rows})
    stats: list[dict[str, Any]] = []
    for group in groups:
        group_rows = [row for row in rows if str(row[attribute]) == group]
        errors = [row for row in group_rows if int(row["prediction"]) != int(row["target"])]
        reviewed_errors = [
            row for row in errors if bool(row.get("reviewed", False))
        ]
        total_errors = len(errors)
        stats.append({
            "group": group,
            "rows": len(group_rows),
            "original_errors": total_errors,
            "reviewed_errors": len(reviewed_errors),
            "error_capture_recall": len(reviewed_errors) / total_errors if total_errors else 0.0,
            "eligible": len(group_rows) >= 10 and total_errors >= 3,
        })
    return stats


def calculate_fairness(
    evaluation_rows: Iterable[Mapping[str, Any]],
    reviewed_ids: Iterable[str],
    protected_attributes: Sequence[str] = ("sex", "school"),
) -> dict[str, Any]:
    """Calculate review-benefit gaps only across eligible groups."""
    rows = _rows(evaluation_rows)
    reviewed = {str(identifier) for identifier in reviewed_ids}
    for row in rows:
        _require(row, "evaluation_id", "prediction", "target", *protected_attributes)
        row["reviewed"] = str(row["evaluation_id"]) in reviewed

    result: dict[str, Any] = {}
    for attribute in protected_attributes:
        groups = _group_stats(rows, attribute)
        eligible = [group for group in groups if group["eligible"]]
        recalls = [float(group["error_capture_recall"]) for group in eligible]
        gap = max(
            (abs(left - right) for left, right in combinations(recalls, 2)),
            default=0.0,
        )
        result[attribute] = {
            "groups": groups,
            "eligible_groups": [group["group"] for group in eligible],
            "observed_review_benefit_gap": gap,
        }
    return result
