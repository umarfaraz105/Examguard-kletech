"""Invigilator schemas for request/response validation."""
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel
from app.models.invigilator import InvigilatorRole


class FacultyAvailabilityBase(BaseModel):
    """Base faculty availability schema."""
    user_id: int
    exam_date: date
    is_available: bool = True
    reason: Optional[str] = None


class FacultyAvailabilityCreate(FacultyAvailabilityBase):
    """Faculty availability creation schema."""
    pass


class FacultyAvailability(FacultyAvailabilityBase):
    """Faculty availability response schema."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InvigilatorAssignmentBase(BaseModel):
    """Base invigilator assignment schema."""
    scheduled_exam_id: int
    user_id: int
    room_id: int
    role: InvigilatorRole


class InvigilatorAssignmentCreate(InvigilatorAssignmentBase):
    """Invigilator assignment creation schema."""
    pass


class InvigilatorAssignment(InvigilatorAssignmentBase):
    """Invigilator assignment response schema."""
    id: int
    workload_points: float
    notification_sent: bool
    confirmed: bool
    confirmed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InvigilatorAssignmentWithDetails(InvigilatorAssignment):
    """Invigilator assignment with user and exam details."""
    faculty_name: str
    faculty_email: str
    faculty_department: str
    exam_date: date
    exam_session: str
    course_code: str
    course_name: str
    room_name: str


class InvigilatorConfirmation(BaseModel):
    """Invigilator confirmation schema."""
    assignment_id: int
    confirmed: bool


class InvigilatorReplacement(BaseModel):
    """Invigilator replacement schema."""
    old_assignment_id: int
    new_user_id: int
    reason: str
