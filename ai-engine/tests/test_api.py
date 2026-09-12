from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_reports_service_status():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_predict_requires_training():
    import app.main as main_module

    main_module._model = None
    response = client.post("/predict", json={"rows": [{"evaluation_id": "student-1", "features": {}}]})

    assert response.status_code == 503
    assert response.json()["detail"] == "Model is not trained"


def test_train_reports_missing_dataset():
    response = client.post("/train", json={"dataset_path": "missing/student-mat.csv"})

    assert response.status_code == 404
    assert "Dataset not found" in response.json()["detail"]


def test_trained_review_workflow_exposes_real_demo_data():
    trained = client.post("/train", json={"dataset_path": "data/student-mat.csv"})
    assert trained.status_code == 200

    queue = client.get("/review-queue")
    assert queue.status_code == 200
    assert len(queue.json()) == 79

    evaluation_id = queue.json()[0]["evaluation_id"]
    explanation = client.get(f"/student/{evaluation_id}/explanation")
    assert explanation.status_code == 200
    assert len(explanation.json()["contributions"]) == 5

    reviewed = client.post("/review", json={
        "evaluation_id": evaluation_id,
        "human_decision": queue.json()[0]["prediction"],
        "reviewer": "Test Teacher",
    })
    assert reviewed.status_code == 200
    assert len(client.get("/review-history").json()) == 1
    assert client.get("/fairness").status_code == 200
    assert client.get("/model-performance").status_code == 200
