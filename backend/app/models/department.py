"""Department model for organizational structure."""
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Department(BaseModel):
    """
    Department model for university organizational structure.
    
    Attributes:
        code: Unique department code (e.g., "CSE", "ECE", "MECH")
        name: Full department name (e.g., "Computer Science & Engineering")
        short_name: Short display name (e.g., "Computer Science")
        description: Department description
        is_active: Whether department is currently active
        hod_id: ID of the Head of Department user
        contact_email: Department contact email
        contact_phone: Department contact phone
        building: Building where department is located
        floor: Floor number in the building
    """
    
    __tablename__ = "departments"
    
    # Basic information
    code = Column(String(10), unique=True, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    short_name = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Leadership
    hod_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    # Contact information
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    
    # Location
    building = Column(String(100), nullable=True)
    floor = Column(String(20), nullable=True)
    
    # Relationships
    hod = relationship("User", foreign_keys=[hod_id], backref="headed_department")
    faculty = relationship("User", foreign_keys="User.department_id", backref="department")
    students = relationship("Student", foreign_keys="Student.department_id", backref="department")
    courses = relationship("Course", foreign_keys="Course.department_id", backref="department")
    
    def __repr__(self) -> str:
        """String representation."""
        return f"<Department(code={self.code}, name={self.name}, active={self.is_active})>"
    
    @property
    def display_name(self) -> str:
        """Get display name (short_name if available, else name)."""
        return self.short_name or self.name
    
    @property
    def faculty_count(self) -> int:
        """Get number of faculty in this department."""
        return len(self.faculty) if self.faculty else 0
    
    @property
    def student_count(self) -> int:
        """Get number of students in this department."""
        return len(self.students) if self.students else 0
    
    @property
    def course_count(self) -> int:
        """Get number of courses offered by this department."""
        return len(self.courses) if self.courses else 0
    
    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "short_name": self.short_name,
            "description": self.description,
            "is_active": self.is_active,
            "hod_id": self.hod_id,
            "hod_name": self.hod.full_name if self.hod else None,
            "contact_email": self.contact_email,
            "contact_phone": self.contact_phone,
            "building": self.building,
            "floor": self.floor,
            "faculty_count": self.faculty_count,
            "student_count": self.student_count,
            "course_count": self.course_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }