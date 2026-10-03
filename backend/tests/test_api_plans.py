"""API integration tests for plan endpoints."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.plan import PlanStatus

client = TestClient(app)


def test_list_plans(db_session, test_plan, auth_headers):
    """Test listing all plans."""
    response = client.get("/api/plans", headers=auth_headers)
    assert response.status_code == 200
    plans = response.json()
    assert len(plans) > 0
    assert any(p["id"] == test_plan.id for p in plans)


def test_get_plan(db_session, test_plan, auth_headers):
    """Test getting a single plan."""
    response = client.get(f"/api/plans/{test_plan.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_plan.id
    assert data["name"] == test_plan.name


def test_create_plan(db_session, test_user, auth_headers):
    """Test creating a new plan."""
    plan_data = {
        "name": "Test Plan",
        "exam_type": "ISA1",
        "academic_year": "2024-25",
        "start_date": "2024-12-01",
        "end_date": "2024-12-10",
        "description": "Test description"
    }
    response = client.post("/api/plans", headers=auth_headers, json=plan_data)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == plan_data["name"]
    assert data["status"] == PlanStatus.DRAFT.value


def test_update_plan(db_session, test_plan, auth_headers):
    """Test updating a plan."""
    update_data = {"name": "Updated Plan Name"}
    response = client.patch(
        f"/api/plans/{test_plan.id}",
        headers=auth_headers,
        json=update_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Plan Name"


def test_approve_plan(db_session, test_plan, auth_headers):
    """Test approving a plan."""
    # First set to PENDING_APPROVAL
    test_plan.status = PlanStatus.PENDING_APPROVAL
    db_session.commit()
    
    response = client.post(f"/api/plans/{test_plan.id}/approve", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == PlanStatus.APPROVED.value


def test_delete_plan(db_session, test_plan, auth_headers):
    """Test deleting a draft plan."""
    response = client.delete(f"/api/plans/{test_plan.id}", headers=auth_headers)
    assert response.status_code == 204


def test_cannot_delete_published_plan(db_session, test_plan, auth_headers):
    """Test that published plans cannot be deleted."""
    test_plan.status = PlanStatus.PUBLISHED
    db_session.commit()
    
    response = client.delete(f"/api/plans/{test_plan.id}", headers=auth_headers)
    assert response.status_code == 400
