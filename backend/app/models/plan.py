"""Exam plan and version management models."""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from app.models.rule import ExamType
import enum


class PlanStatus(str, enum.Enum):
    """Exam plan status enumeration."""
    DRAFT = "DRAFT"              # Being created/edited
    PENDING_APPROVAL = "PENDING_APPROVAL"  # Submitted for review
    APPROVED = "APPROVED"        # Approved by HOD/Exam Cell
    PUBLISHED = "PUBLISHED"      # Active and in use
    ARCHIVED = "ARCHIVED"        # Historical record


class Plan(BaseModel):
    """
    Exam plan version model.
    
    Supports what-if scenarios by maintaining multiple plan versions.
    Only one plan can be PUBLISHED at a time per exam type and academic period.
    
    Attributes:
        plan_name: Descriptive name for the plan
        exam_type: Type of exam (ISA1, ISA2, ESA, etc.)
        academic_year: Academic year (e.g., "2023-24")
        semester: Semester number
        version: Version number (auto-incremented)
        status: Current status (DRAFT, PENDING_APPROVAL, etc.)
        created_by_id: User who created the plan
        approved_by_id: User who approved the plan
        approved_at: Timestamp of approval
        published_at: Timestamp when plan was published
        description: Plan description or notes
        is_what_if: Whether this is a what-if scenario (doesn't affect published)
    """
    
    __tablename__ = "plans"
    
    plan_name = Column(String(255), nullable=False)
    exam_type = Column(SQLEnum(ExamType), nullable=False, index=True)
    academic_year = Column(String(20), nullable=False, index=True)
    semester = Column(Integer, nullable=False, index=True)
    version = Column(Integer, nullable=False, default=1)
    status = Column(SQLEnum(PlanStatus), nullable=False, default=PlanStatus.DRAFT, index=True)
    description = Column(Text, nullable=True)
    is_what_if = Column(Boolean, default=False, nullable=False)
    
    # Timestamps for workflow
    published_at = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # User relationships
    created_by_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    approved_by_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    
    created_by = relationship("User", foreign_keys=[created_by_id])
    approved_by = relationship("User", foreign_keys=[approved_by_id])
    
    # One-to-many with scheduled exams
    scheduled_exams = relationship(
        "ScheduledExam",
        back_populates="plan",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        """String representation."""
        return (
            f"<Plan(name={self.plan_name}, type={self.exam_type}, "
            f"version={self.version}, status={self.status})>"
        )
    
    @property
    def is_editable(self) -> bool:
        """Check if plan can be edited."""
        return self.status in [PlanStatus.DRAFT]
    
    @property
    def can_be_published(self) -> bool:
        """Check if plan can be published."""
        return self.status == PlanStatus.APPROVED and not self.is_what_if
    
    @property
    def is_active(self) -> bool:
        """Check if plan is currently active."""
        return self.status == PlanStatus.PUBLISHED
