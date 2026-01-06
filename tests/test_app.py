import pytest
from fastapi.testclient import TestClient

from src.app import app, activities


@pytest.fixture(autouse=True)
def reset_activities():
    # make a shallow copy of participants and restore after each test
    original = {k: v["participants"][:] for k, v in activities.items()}
    yield
    for k, parts in original.items():
        activities[k]["participants"] = parts[:]


def test_get_activities():
    client = TestClient(app)
    r = client.get("/activities")
    assert r.status_code == 200
    data = r.json()
    assert "Soccer Team" in data


def test_signup_and_duplicate_rejected():
    client = TestClient(app)
    email = "testuser@example.com"
    # sign up
    r = client.post(f"/activities/Soccer%20Team/signup?email={email}")
    assert r.status_code == 200
    assert email in activities["Soccer Team"]["participants"]

    # duplicate should be rejected
    r2 = client.post(f"/activities/Soccer%20Team/signup?email={email}")
    assert r2.status_code == 400


def test_remove_participant():
    client = TestClient(app)
    email = "remove-me@example.com"
    # ensure present
    activities["Debate Team"]["participants"].append(email)

    r = client.delete(f"/activities/Debate%20Team/participants?email={email}")
    assert r.status_code == 200
    assert email not in activities["Debate Team"]["participants"]
