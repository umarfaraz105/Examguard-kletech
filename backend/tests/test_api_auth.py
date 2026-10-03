"""API integration tests for authentication endpoints."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import get_password_hash

client = TestClient(app)


def test_login_success(db_session, test_user):
    """Test successful login."""
    response = client.post(
        "/api/auth/login",
        json={"email": test_user.email, "password": "testpassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(db_session):
    """Test login with invalid credentials."""
    response = client.post(
        "/api/auth/login",
        json={"email": "invalid@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_get_current_user(db_session, test_user, auth_headers):
    """Test getting current user info."""
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert data["full_name"] == test_user.full_name


def test_get_current_user_unauthorized(db_session):
    """Test getting current user without token."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_change_password(db_session, test_user, auth_headers):
    """Test password change."""
    response = client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={
            "current_password": "testpassword",
            "new_password": "newpassword123"
        }
    )
    assert response.status_code == 200
    assert "message" in response.json()


def test_change_password_wrong_current(db_session, test_user, auth_headers):
    """Test password change with wrong current password."""
    response = client.post(
        "/api/auth/change-password",
        headers=auth_headers,
        json={
            "current_password": "wrongpassword",
            "new_password": "newpassword123"
        }
    )
    assert response.status_code == 400
