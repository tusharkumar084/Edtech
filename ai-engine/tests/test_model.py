import pandas as pd
import pytest

from app.model import MODEL_FEATURES, prepare_training_data, train_model


def make_frame(rows: int = 20) -> pd.DataFrame:
    data = {
        feature: ([0, 1] * (rows // 2 + 1))[:rows]
        for feature in MODEL_FEATURES
    }
    for feature in ["school", "sex", "address", "famsize", "Pstatus", "Mjob", "Fjob", "reason", "guardian", "schoolsup", "famsup", "paid", "activities", "nursery", "higher", "internet", "romantic"]:
        data[feature] = (["GP", "MS"] * (rows // 2 + 1))[:rows]
    data["G3"] = ([8, 12] * (rows // 2 + 1))[:rows]
    return pd.DataFrame(data)


def test_g3_is_excluded_from_training_features():
    features, target = prepare_training_data(make_frame())

    assert "G3" not in features.columns
    assert list(features.columns) == MODEL_FEATURES
    assert target.tolist()[:2] == [1, 0]


def test_model_produces_probabilities_without_labels():
    model, _ = train_model(make_frame())
    predictions = model.pipeline.predict_proba(make_frame()[MODEL_FEATURES])

    assert predictions.shape == (20, 2)
    assert all(0 <= probability <= 1 for probability in predictions[:, 1])


def test_missing_dataset_is_explicit():
    from app.model import load_dataset

    with pytest.raises(FileNotFoundError, match="student-mat.csv"):
        load_dataset("missing/student-mat.csv")
