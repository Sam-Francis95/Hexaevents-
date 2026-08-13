"""
Shared fixtures for the backend test suite. Uses mongomock the same way
app/extensions.py's init_mongo() was already built to support (via
mongo_client_override) -- no real MongoDB needed to run this suite.

NOTE: this project's zip did not actually contain a prior tests/ directory
despite the README describing 40 assertions run against mongomock, so this
file (and test_submissions.py) is a fresh suite rather than a literal
extension of an existing one -- written to match the same pattern the app
factory was already designed for.
"""
import io

import mongomock
import pytest

from app import create_app
from app.config import Config


class TestConfig(Config):
    JWT_SECRET_KEY = "test-secret"
    CORS_ORIGINS = ["http://localhost:5173"]


@pytest.fixture
def app(tmp_path):
    test_config = TestConfig
    test_config.UPLOAD_FOLDER = str(tmp_path / "uploads")
    application = create_app(
        config_class=test_config,
        mongo_client_override=mongomock.MongoClient("mongodb://localhost/smartevent_test"),
    )
    return application


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def register_user(client):
    """Signs up a fresh participant and returns (auth_headers, user_id)."""
    def _register(name="Sachin Tendulkar", email=None, password="password123"):
        email = email or f"{name.lower().replace(' ', '.')}@example.com"
        res = client.post("/api/auth/register", json={"name": name, "email": email, "password": password})
        assert res.status_code == 200, res.get_json()
        body = res.get_json()
        token = body["data"]["token"]
        user_id = body["data"]["user"]["id"]
        return {"Authorization": f"Bearer {token}"}, user_id
    return _register


@pytest.fixture
def make_event(app):
    """Inserts an event document directly into the mongomock db and returns its id."""
    def _make(**overrides):
        event = {
            "title": "CodeSprint 48 — Internal Hackathon",
            "description": "Test hackathon event.",
            "category": "Hackathon",
            "mode": "offline",
            "venue": "Test Campus",
            "startDate": "2026-09-01T09:00:00+00:00",
            "endDate": "2026-09-02T09:00:00+00:00",
            "registrationDeadline": "2026-08-28T23:59:00+00:00",
            "capacity": 50,
            "eligibilityRules": [],
            "agenda": [],
            "status": "published",
            "organizerId": "seed-organizer",
            "requiresSubmission": False,
            "teamSizeLimit": None,
            "submissionDeadline": None,
            "bannerColor": "#8B5CF6",
            "createdAt": "2026-08-01T00:00:00+00:00",
            "updatedAt": "2026-08-01T00:00:00+00:00",
        }
        event.update(overrides)
        result = app.db.events.insert_one(event)
        return str(result.inserted_id)
    return _make


@pytest.fixture
def fake_pdf():
    def _make(name="submission.pdf"):
        return (io.BytesIO(b"%PDF-1.4 fake pdf content for tests"), name)
    return _make
