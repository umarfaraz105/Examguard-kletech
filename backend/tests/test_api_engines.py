"""API integration tests for engine endpoints."""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_generate_schedule(db_session, test_plan, test_courses, auth_headers):
    """Test schedule generation via API."""
    course_ids = [c.id for c in test_courses[:3]]
    response = client.post(
        "/api/engines/schedule/generate",
        headers=auth_headers,
        json={
            "plan_id": test_plan.id,
            "course_ids": course_ids,
            "timeout_seconds": 30
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert "message" in data
    assert "status" in data


def test_validate_plan(db_session, test_plan, auth_headers):
    """Test plan validation via API."""
    response = client.post(
        "/api/engines/validate",
        headers=auth_headers,
        json={
            "plan_id": test_plan.id,
            "include_details": True
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "compliance_score" in data
    assert "grade" in data
    assert "total_issues" in data
    assert "issues_by_severity" in data


def test_get_dashboard(db_session, test_plan, auth_headers):
    """Test getting conflict dashboard via API."""
    response = client.post(
        "/api/engines/dashboard",
        headers=auth_headers,
        json={"plan_id": test_plan.id}
    )
    assert response.status_code == 200
    data = response.json()
    assert "overview" in data
    assert "by_severity" in data
    assert "by_rule" in data


def test_allocate_rooms_without_schedule(db_session, auth_headers):
    """Test that room allocation requires valid scheduled exam."""
    response = client.post(
        "/api/engines/rooms/allocate",
        headers=auth_headers,
        json={"scheduled_exam_id": 99999}
    )
    assert response.status_code == 404


def test_allocate_seats_without_schedule(db_session, auth_headers):
    """Test that seat allocation requires valid scheduled exam."""
    response = client.post(
        "/api/engines/seats/allocate",
        headers=auth_headers,
        json={"scheduled_exam_id": 99999}
    )
    assert response.status_code == 404


def test_assign_invigilators_without_schedule(db_session, auth_headers):
    """Test that invigilator assignment requires valid scheduled exam."""
    response = client.post(
        "/api/engines/invigilators/assign",
        headers=auth_headers,
        json={
            "scheduled_exam_id": 99999,
            "auto_assign": True
        }
    )
    assert response.status_code == 404
