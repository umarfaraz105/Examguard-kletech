"""Department schemas for request/response validation."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class DepartmentBase(BaseModel):
    """Base department schema."""
    code: str = Field(..., min_length=2, max_length=10, description="Department code (e.g., CSE, ECE)")
    name: str = Field(..., min_length=3, max_length=200, description="Full department name")
    short_name: Optional[str] = Field(None, max_length=100, description="Short display name")
    description: Optional[str] = None
    is_active: bool = True
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    building: Optional[str] = None
    floor: Optional[str] = None


class DepartmentCreate(DepartmentBase):
    """Department creation schema."""
    hod_id: Optional[int] = Field(None, description="Head of Department user ID")


class DepartmentUpdate(BaseModel):
    """Department update schema."""
    code: Optional[str] = Field(None, min_length=2, max_length=10)
    name: Optional[str] = Field(None, min_length=3, max_length=200)
    short_name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None
    hod_id: Optional[int] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    building: Optional[str] = None
    floor: Optional[str] = None


class Department(DepartmentBase):
    """Department response schema."""
    id: int
    hod_id: Optional[int]
    hod_name: Optional[str]
    faculty_count: int
    student_count: int
    course_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DepartmentSummary(BaseModel):
    """Lightweight department summary."""
    id: int
    code: str
    name: str
    short_name: Optional[str]
    is_active: bool
    hod_name: Optional[str]

    class Config:
        from_attributes = True


class DepartmentUploadStatus(BaseModel):
    """Department CSV upload status."""
    department_id: int
    department_code: str
    department_name: str
    upload_status: str  # PENDING, UPLOADED, VALIDATED, APPROVED
    uploaded_at: Optional[datetime]
    validated_at: Optional[datetime] 
    approved_at: Optional[datetime]
    record_count: int
    error_count: int
    hod_name: Optional[str]

    class Config:
        from_attributes = True