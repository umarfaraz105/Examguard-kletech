"""User schemas for request/response validation."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


# Base schemas
class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: str
    employee_id: Optional[str] = None
    department: Optional[str] = None
    role: UserRole = UserRole.FACULTY


class UserCreate(UserBase):
    """User creation schema."""
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    """User update schema."""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    employee_id: Optional[str] = None
    department: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserPasswordUpdate(BaseModel):
    """Password update schema."""
    current_password: str
    new_password: str = Field(..., min_length=8)


class User(UserBase):
    """User response schema."""
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserInDB(User):
    """User schema with password hash."""
    hashed_password: str


# Auth schemas
class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    csrf_token: Optional[str] = None  # For admin users


class TokenData(BaseModel):
    """Token payload data."""
    user_id: Optional[int] = None
    email: Optional[str] = None


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str
