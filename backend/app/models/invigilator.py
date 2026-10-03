"""Invigilator assignment model - output of Engine 3."""
from sqlalchemy import Column, Integer, ForeignKey, Boolean, String, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum


class InvigilatorRole(str, enum.Enum):
    """Invigilator role enumeration."""
    PRIMARY = "PRIMARY"      # Primary invigilator
    RELIEF = "RELIEF"        # Relief/break replacement
    RESERVE = "RESERVE"      # Reserve/backup


class InvigilatorStatus(str, enum.Enum):
    """Invigilator assignment status."""
    ASSIGNED = "ASSIGNED"
    CONFIRMED = "CONFIRMED"
    DECLINED = "DECLINED"
    REPLACED = "REPLACED"


class InvigilatorAssignment(BaseModel):
    """
    Invigilator assignment model.
    
    Represents faculty assigned to invigilate an exam.
    This is the output of Engine 3 (Exam Management).
    
    Attributes:
        scheduled_exam_id: Foreign key to scheduled exam
        faculty_id: Foreign key to faculty user
        role: Invigilator role (PRIMARY, RELIEF, RESERVE)
        status: Assignment status
        workload_points: Points contributing to faculty workload
        is_available: Whether faculty confirmed availability
        replacement_for_id: If this is a replacement, original assignment ID
        remarks: Additional notes
    """
    
    __tablename__ = "invigilator_assignments"
    
    # Foreign keys
    scheduled_exam_id = Column(
        Integer,
        ForeignKey('scheduled_exams.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    faculty_id = Column(
        Integer,
        ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    
    # Assignment details
    role = Column(SQLEnum(InvigilatorRole), nullable=False, default=InvigilatorRole.PRIMARY)
    status = Column(SQLEnum(InvigilatorStatus), nullable=False, default=InvigilatorStatus.ASSIGNED)
    workload_points = Column(Integer, nullable=False, default=1)
    is_available = Column(Boolean, nullable=True)  # NULL = not responded
    
    # Replacement tracking
    replacement_for_id = Column(
        Integer,
        ForeignKey('invigilator_assignments.id', ondelete='SET NULL'),
        nullable=True
    )
    
    remarks = Column(String(500), nullable=True)
    
    # Relationships
    scheduled_exam = relationship("ScheduledExam", back_populates="invigilator_assignments")
    faculty = relationship("User", foreign_keys=[faculty_id])
    replacement_for = relationship(
        "InvigilatorAssignment",
        remote_side="InvigilatorAssignment.id",
        foreign_keys=[replacement_for_id]
    )
    
    def __repr__(self) -> str:
        """String representation."""
        faculty_name = self.faculty.full_name if self.faculty else "N/A"
        exam_info = f"{self.scheduled_exam.course.course_code}" if self.scheduled_exam else "N/A"
        return (
            f"<InvigilatorAssignment(faculty={faculty_name}, exam={exam_info}, "
            f"role={self.role}, status={self.status})>"
        )
    
    @property
    def is_confirmed(self) -> bool:
        """Check if faculty confirmed the assignment."""
        return self.status == InvigilatorStatus.CONFIRMED
    
    @property
    def needs_replacement(self) -> bool:
        """Check if this assignment needs replacement."""
        return self.status in [InvigilatorStatus.DECLINED, InvigilatorStatus.REPLACED]


class FacultyAvailability(BaseModel):
    """
    Faculty availability tracking.
    
    Tracks faculty availability for specific dates/sessions.
    Used by Engine 3 for intelligent assignment.
    
    Attributes:
        faculty_id: Foreign key to faculty user
        exam_date: Date of unavailability
        session: Session of unavailability (optional, NULL = all day)
        reason: Reason for unavailability
        is_available: Whether faculty is available (False = unavailable)
    """
    
    __tablename__ = "faculty_availability"
    
    faculty_id = Column(
        Integer,
        ForeignKey('users.id', ondelete='CASCADE'),
        nullable=False,
        index=True
    )
    exam_date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    session = Column(String(20), nullable=True)  # MORNING, AFTERNOON, or NULL
    reason = Column(String(500), nullable=True)
    is_available = Column(Boolean, nullable=False, default=True)
    
    # Relationships
    faculty = relationship("User")
    
    def __repr__(self) -> str:
        """String representation."""
        faculty_name = self.faculty.full_name if self.faculty else "N/A"
        return f"<FacultyAvailability(faculty={faculty_name}, date={self.exam_date})>"
