"""Course/subject model."""
from sqlalchemy import Column, String, Integer, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.models.base import BaseModel, Base

# Many-to-many relationship: students enrolled in courses
student_course = Table(
    'student_course',
    Base.metadata,
    Column('student_id', Integer, ForeignKey('students.id', ondelete='CASCADE'), primary_key=True),
    Column('course_id', Integer, ForeignKey('courses.id', ondelete='CASCADE'), primary_key=True)
)


class Course(BaseModel):
    """
    Course/Subject model.
    
    Represents a course offered in a semester.
    
    Attributes:
        course_code: Unique course code (e.g., "CS101", "MATH201")
        course_name: Full course name
        semester: Semester number (1-8)
        department_id: Foreign key to Department table
        branch_legacy: Legacy branch field (for migration from "branch" string)
        credits: Number of credits
        faculty_id: ID of faculty teaching the course
        section: Section identifier (e.g., "A", "B") if multiple sections
        academic_year: Academic year (e.g., "2023-24")
    """
    
    __tablename__ = "courses"
    
    course_code = Column(String(20), nullable=False, index=True)
    course_name = Column(String(255), nullable=False)
    semester = Column(Integer, nullable=False, index=True)
    
    # Department relationship
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True, index=True)
    branch_legacy = Column(String(50), nullable=True, index=True)  # Keep old "branch" for migration
    
    credits = Column(Integer, nullable=False, default=3)
    section = Column(String(10), nullable=True)
    academic_year = Column(String(20), nullable=False, index=True)
    
    # Relationships
    faculty_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    faculty = relationship("User", foreign_keys=[faculty_id])
    
    # Many-to-many with students
    students = relationship(
        "Student",
        secondary=student_course,
        back_populates="courses"
    )
    
    # One-to-many with scheduled exams
    scheduled_exams = relationship(
        "ScheduledExam",
        back_populates="course",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        """String representation."""
        dept_code = self.department.code if self.department else self.branch_legacy
        return f"<Course(code={self.course_code}, name={self.course_name}, dept={dept_code})>"
    
    @property
    def full_code(self) -> str:
        """Get full course identifier including section."""
        if self.section:
            return f"{self.course_code}-{self.section}"
        return self.course_code
    
    @property
    def branch(self) -> str:
        """Get department/branch code (backward compatibility)."""
        if self.department:
            return self.department.code
        return self.branch_legacy or "Unknown"
