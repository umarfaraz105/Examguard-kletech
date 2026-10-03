"""User model for authentication and authorization."""
from typing import List
from sqlalchemy import Column, String, Boolean, Enum as SQLEnum, Integer, ForeignKey
from app.models.base import BaseModel
import enum


class UserRole(str, enum.Enum):
    """User role enumeration."""
    ADMIN = "ADMIN"              # Full system access - hidden login
    EXAM_CELL = "EXAM_CELL"      # Exam planning and management (displayed as "Staff")
    HOD = "HOD"                  # Head of Department - review and approve
    FACULTY = "FACULTY"          # Faculty members - view and invigilate
    STUDENT = "STUDENT"          # Students - view own data
    
    @classmethod
    def get_display_name(cls, role: 'UserRole') -> str:
        """Get user-friendly display name for role."""
        display_map = {
            cls.ADMIN: "Administrator",
            cls.EXAM_CELL: "Staff",  # Rename EXAM_CELL to Staff in UI
            cls.HOD: "HOD", 
            cls.FACULTY: "Faculty",
            cls.STUDENT: "Student"
        }
        return display_map.get(role, role.value)
    
    @classmethod 
    def get_public_roles(cls) -> List['UserRole']:
        """Get roles that appear on main login page (excludes ADMIN)."""
        return [cls.EXAM_CELL, cls.HOD, cls.FACULTY, cls.STUDENT]


class User(BaseModel):
    """
    User model for authentication and role-based access control.
    
    Attributes:
        email: Unique email address (login username)
        full_name: User's full name
        hashed_password: Bcrypt hashed password
        role: User role (ADMIN, EXAM_CELL, HOD, FACULTY, STUDENT)
        is_active: Whether user account is active
        department: Department affiliation (for HOD and Faculty)
        employee_id: University employee ID
        phone: Contact phone number
    """
    
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Additional information
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True, index=True)
    employee_id = Column(String(50), unique=True, nullable=True, index=True)
    phone = Column(String(20), nullable=True)
    
    def __repr__(self) -> str:
        """String representation."""
        return f"<User(email={self.email}, role={self.role}, active={self.is_active})>"
    
    @property
    def is_admin(self) -> bool:
        """Check if user is admin."""
        return self.role == UserRole.ADMIN
    
    @property
    def is_staff(self) -> bool:
        """Check if user is staff (exam cell member)."""
        return self.role in [UserRole.ADMIN, UserRole.EXAM_CELL]
    
    @property
    def is_exam_cell(self) -> bool:
        """Check if user is exam cell member (legacy - use is_staff)."""
        return self.role in [UserRole.ADMIN, UserRole.EXAM_CELL]
    
    @property
    def is_student(self) -> bool:
        """Check if user is a student."""
        return self.role == UserRole.STUDENT
    
    @property
    def can_manage_plans(self) -> bool:
        """Check if user can create/modify exam plans."""
        return self.role in [UserRole.ADMIN, UserRole.EXAM_CELL]
    
    @property
    def can_approve_plans(self) -> bool:
        """Check if user can approve exam plans."""
        return self.role in [UserRole.ADMIN, UserRole.EXAM_CELL, UserRole.HOD]
    
    @property
    def can_upload_csv(self) -> bool:
        """Check if user can upload course registration CSV."""
        return self.role == UserRole.HOD
    
    @property
    def can_view_own_data_only(self) -> bool:
        """Check if user can only view their own data (students)."""
        return self.role == UserRole.STUDENT
