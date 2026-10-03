"""Student schemas for request/response validation."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


class StudentBase(BaseModel):
    """Base student schema."""
    usn: str
    name: str
    email: EmailStr
    branch: str
    semester: int
    section: Optional[str] = None


class StudentCreate(StudentBase):
    """Student creation schema."""
    course_ids: Optional[List[int]] = []


class StudentUpdate(BaseModel):
    """Student update schema."""
    usn: Optional[str] = None
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    branch: Optional[str] = None
    semester: Optional[int] = None
    section: Optional[str] = None


class Student(StudentBase):
    """Student response schema."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StudentWithCourses(Student):
    """Student with enrolled courses."""
    course_count: int


class StudentCourseEnrollment(BaseModel):
    """Student course enrollment schema."""
    student_id: int
    course_ids: List[int]
