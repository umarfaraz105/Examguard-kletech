"""Schedule schemas for request/response validation."""
from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel
from app.models.schedule import ExamSession


class ScheduledExamBase(BaseModel):
    """Base scheduled exam schema."""
    plan_id: int
    course_id: int
    exam_date: date
    session: ExamSession


class ScheduledExamCreate(ScheduledExamBase):
    """Scheduled exam creation schema."""
    pass


class ScheduledExam(ScheduledExamBase):
    """Scheduled exam response schema."""
    id: int
    start_time: datetime
    end_time: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ScheduledExamWithDetails(ScheduledExam):
    """Scheduled exam with course details."""
    course_code: str
    course_name: str
    student_count: int
    room_count: Optional[int] = None
    seat_count: Optional[int] = None
    invigilator_count: Optional[int] = None
