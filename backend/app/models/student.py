"""Student model."""
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Student(BaseModel):
    """
    Student model.
    
    Represents a student enrolled in the university.
    
    Attributes:
        usn: University Seat Number (unique identifier)
        full_name: Student's full name
        semester: Current semester (1-8)
        department_id: Foreign key to Department table
        branch_legacy: Legacy branch field (for migration from "branch" string)
        section: Section identifier (e.g., "A", "B")
        email: Student email address
        phone: Contact phone number
        is_active: Whether student is currently active
        attendance_percentage: Overall attendance percentage
        academic_year: Academic year of admission
        user_id: Optional link to User account (for login)
    """
    
    __tablename__ = "students"
    
    usn = Column(String(20), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    semester = Column(Integer, nullable=False, index=True)
    
    # Department relationship
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True, index=True)
    branch_legacy = Column(String(50), nullable=True, index=True)  # Keep old "branch" for migration
    
    section = Column(String(10), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    attendance_percentage = Column(Float, nullable=True)
    academic_year = Column(String(20), nullable=False)
    
    # Link to User account (for student login)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="student_profile")
    
    # Many-to-many with courses
    courses = relationship(
        "Course",
        secondary="student_course",
        back_populates="students"
    )
    
    # One-to-many with seat assignments
    seat_assignments = relationship(
        "SeatAssignment",
        back_populates="student",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        """String representation."""
        return f"<Student(usn={self.usn}, name={self.full_name}, dept={self.department.code if self.department else self.branch_legacy})>"
    
    @property
    def is_eligible(self) -> bool:
        """
        Check if student meets basic eligibility criteria.
        
        Typically requires minimum attendance percentage.
        Actual threshold comes from rules, but this provides a quick check.
        """
        if self.attendance_percentage is None:
            return True  # Assume eligible if no attendance data
        return self.attendance_percentage >= 75.0
    
    @property
    def display_name(self) -> str:
        """Get display name with USN."""
        return f"{self.full_name} ({self.usn})"
    
    @property
    def branch(self) -> str:
        """Get department/branch name (backward compatibility)."""
        if self.department:
            return self.department.code
        return self.branch_legacy or "Unknown"
