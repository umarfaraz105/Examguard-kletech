"""Course schemas for request/response validation."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CourseBase(BaseModel):
    """Base course schema."""
    code: str
    name: str
    semester: int
    branch: str
    credits: Optional[int] = 3


class CourseCreate(CourseBase):
    """Course creation schema."""
    pass


class CourseUpdate(BaseModel):
    """Course update schema."""
    code: Optional[str] = None
    name: Optional[str] = None
    semester: Optional[int] = None
    branch: Optional[str] = None
    credits: Optional[int] = None


class Course(CourseBase):
    """Course response schema."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CourseWithEnrollment(Course):
    """Course with enrollment count."""
    enrollment_count: int
