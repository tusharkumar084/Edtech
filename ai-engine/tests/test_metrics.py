from app.metrics import calculate_fairness, calculate_metrics


def make_rows():
    rows = []
    for index in range(20):
        target = 1 if index < 5 else 0
        prediction = 0 if index < 3 else target
        rows.append({
            "evaluation_id": f"student-{index:02d}",
            "prediction": prediction,
            "prediction_probability": 0.8 if target else 0.2,
            "target": target,
            "sex": "F" if index < 10 else "M",
            "school": "GP" if index < 10 else "MS",
        })
    return rows


def test_metrics_simulate_perfect_review_only_for_selected_rows():
    metrics = calculate_metrics(make_rows(), ["student-00", "student-01"])

    assert metrics["evaluation_size"] == 20
    assert metrics["review_budget"] == 4
    assert metrics["before_review_accuracy"] == 0.85
    assert metrics["after_review_accuracy"] == 0.95
    assert metrics["reviewed_model_errors"] == 2
    assert metrics["review_efficiency"] == 0.5
    assert metrics["brier_score"] == 0.04
    assert metrics["calibration_utility"] == 0.96


def test_fairness_requires_eligible_groups_and_calculates_gap():
    rows = make_rows()
    fairness = calculate_fairness(rows, ["student-00", "student-01", "student-02"])

    sex = fairness["sex"]
    assert sex["eligible_groups"] == ["F"]
    assert sex["observed_review_benefit_gap"] == 0
    assert sex["groups"][0]["reviewed_errors"] == 3


def test_fairness_gap_compares_two_eligible_groups():
    rows = make_rows()
    for index, row in enumerate(rows):
        row["target"] = 1 if index % 2 == 0 else 0
        row["prediction"] = 0
        row["prediction_probability"] = 0.2
    reviewed = [f"student-{index:02d}" for index in range(0, 10, 2)]

    fairness = calculate_fairness(rows, reviewed)

    assert fairness["sex"]["eligible_groups"] == ["F", "M"]
    assert fairness["sex"]["observed_review_benefit_gap"] == 1.0
