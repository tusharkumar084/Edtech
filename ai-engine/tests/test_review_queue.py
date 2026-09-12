import pytest

from app.review_queue import add_review_priority, review_priority_score, select_review_queue


def test_priority_is_highest_at_decision_boundary():
    assert review_priority_score(0.5) == 1
    assert review_priority_score(0) == 0
    assert review_priority_score(1) == 0


def test_queue_selects_exact_ceiling_budget():
    predictions = [
        {"evaluation_id": str(index), "prediction_probability": index / 10}
        for index in range(10)
    ]

    queue = select_review_queue(predictions)

    assert len(queue) == 2
    assert {row["evaluation_id"] for row in queue} == {"4", "5"}


def test_queue_uses_lexical_id_tie_breaking():
    predictions = [
        {"evaluation_id": "student-10", "prediction_probability": 0.5},
        {"evaluation_id": "student-2", "prediction_probability": 0.5},
        {"evaluation_id": "student-1", "prediction_probability": 0.5},
    ]

    queue = select_review_queue(predictions, review_fraction=2 / 3)

    assert [row["evaluation_id"] for row in queue] == ["student-1", "student-10"]


def test_all_rows_receive_priority_scores():
    scored = add_review_priority([
        {"evaluation_id": "a", "prediction_probability": 0.25},
        {"evaluation_id": "b", "prediction_probability": 0.75},
    ])

    assert [row["review_priority_score"] for row in scored] == [0.5, 0.5]


def test_invalid_probability_is_rejected():
    with pytest.raises(ValueError, match="between 0 and 1"):
        review_priority_score(1.1)
