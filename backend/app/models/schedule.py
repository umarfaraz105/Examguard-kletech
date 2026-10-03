"""Scheduled exam model - output of Engine 1."""
from sqlalchemy import Column, String, Integer, Date, Time, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class ExamSession(str, enum.Enum):
    """Exam session time slot enumeration."""
    MORNING = "MORNING"      # Typically 09:00-12:00
    AFTERNOON = "AFTERNOON"  # Typically 14:00-17:00
    EVENING = "EVENING"      # For special cases


class ScheduledExam(BaseModel):
    """
    Scheduled exam model.
    
    Represents a course exam scheduled for a specific date, time, and room.
    This is the output of Engine 1 (Scheduling) and input to Engine 2 (Seating).
    
    Attributes:
        plan_id: Foreign key to exam plan
        course_id: Foreign key to course
        room_id: Foreign key to room (can be NULL before Engine 2)
        exam_date: Date of the exam
        session: Time session (MORNING, AFTERNOON)
        start_time: Exact start time
        end_time: Exact end time
        duration_minutes: Duration in minutes
        num_students: Number of students scheduled
        remarks: Additional notes
    """
    
    __tablename__ = "scheduled_exams"
    
    # Foreign keys
    plan_id = Column(Integer, ForeignKey('plans.id', ondelete='CASCADE'), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey('courses.id', ondelete='CASCADE'), nullable=False, index=True)
    room_id = Column(Integer, ForeignKey('rooms.id', ondelete='SET NULL'), nullable=True, index=True)
    
    # Schedule details
    exam_date = Column(Date, nullable=False, index=True)
    session = Column(SQLEnum(ExamSession), nullable=False, index=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    num_students = Column(Integer, nullable=False, default=0)
    remarks = Column(String(500), nullable=True)
    
    # Relationships
    plan = relationship("Plan", back_populates="scheduled_exams")
    course = relationship("Course", back_populates="scheduled_exams")
    room = relationship("Room", back_populates="scheduled_exams")
    
    # One-to-many with seat assignments
    seat_assignments = relationship(
        "SeatAssignment",
        back_populates="scheduled_exam",
        cascade="all, delete-orphan"
    )
    
    # One-to-many with invigilator assignments
    invigilator_assignments = relationship(
        "InvigilatorAssignment",
        back_populates="scheduled_exam",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        """String representation."""
        course_code = self.course.course_code if self.course else "N/A"
        room_code = self.room.room_code if self.room else "Unassigned"
        return (
            f"<ScheduledExam(course={course_code}, date={self.exam_date}, "
            f"session={self.session}, room={room_code})>"
        )
    
    @property
    def is_room_assigned(self) -> bool:
        """Check if room has been assigned."""
        return self.room_id is not None
    
    @property
    def has_seating(self) -> bool:
        """Check if seating has been allocated."""
        return len(self.seat_assignments) > 0
    
    @property
    def has_invigilators(self) -> bool:
        """Check if invigilators have been assigned."""
        return len(self.invigilator_assignments) > 0
