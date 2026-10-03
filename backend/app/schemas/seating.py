"""Seating schemas for request/response validation."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class SeatAssignmentBase(BaseModel):
    """Base seat assignment schema."""
    scheduled_exam_id: int
    student_id: int
    room_id: int
    bench_id: int
    seat_code: str
    row: int
    column: int
    position: str


class SeatAssignmentCreate(SeatAssignmentBase):
    """Seat assignment creation schema."""
    pass


class SeatAssignment(SeatAssignmentBase):
    """Seat assignment response schema."""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SeatAssignmentWithDetails(SeatAssignment):
    """Seat assignment with student and room details."""
    student_usn: str
    student_name: str
    student_branch: str
    room_name: str
    bench_number: str
