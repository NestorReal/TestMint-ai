import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.domain.schemas import TestCaseResponse, TestCase
from app.evaluator.scoring import evaluate_quality

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "TestMint.ai API is running."}

def test_scoring_heuristic_perfect_score():
    tc = TestCase(
        title="Valid login",
        preconditions="User must exist",
        steps=["Open browser", "Enter user and pass", "Click submit"],
        expected_result="Login successful"
    )
    # This should evaluate to 1.0 -> (0.2 + 0.4 + 0.4)
    response = TestCaseResponse(test_cases=[tc])
    evaluated = evaluate_quality(response)
    
    assert evaluated.quality_score == 1.0

def test_scoring_heuristic_partial_score():
    tc = TestCase(
        title="Missing preconditions and short steps",
        preconditions="N/A",  # Doesn't count
        steps=["Step 1"],     # Less than 3 steps
        expected_result="Something happens"
    )
    # This should evaluate to 0.4 -> (0.0 + 0.0 + 0.4)
    response = TestCaseResponse(test_cases=[tc])
    evaluated = evaluate_quality(response)
    
    assert evaluated.quality_score == 0.4

def test_generate_tests_validation_error():
    # Sending an invalid body triggers 422 HTTP error from FastAPI Pydantic validation
    response = client.post("/generate-tests", json={"user_story": ""})
    assert response.status_code == 400
    assert "demasiado corta" in response.json()["detail"]
