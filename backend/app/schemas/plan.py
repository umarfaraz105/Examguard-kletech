"""Plan schemas for request/response validation."""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel
from app.models.plan import PlanStatus


class PlanBase(BaseModel):
    """Base plan schema."""
    name: str
    exam_type: str
    academic_year: str
    start_date: date
    end_date: date
    description: Optional[str] = None


class PlanCreate(PlanBase):
    """Plan creation schema."""
    pass


class PlanUpdate(BaseModel):
    """Plan update schema."""
    name: Optional[str] = None
    exam_type: Optional[str] = None
    academic_year: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: Optional[str] = None
    status: Optional[PlanStatus] = None


class Plan(PlanBase):
    """Plan response schema."""
    id: int
    version: int
    status: PlanStatus
    approved_by_id: Optional[int] = None
    approved_at: Optional[datetime] = None
    created_by_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PlanWithStats(Plan):
    """Plan with statistics."""
    scheduled_exams_count: int
    seat_assignments_count: int
    invigilator_assignments_count: int
    compliance_score: Optional[float] = None
