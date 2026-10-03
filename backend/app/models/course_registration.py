"""Course registration model for HOD CSV uploads."""
from sqlalchemy import Column, String, Integer, Float, ForeignKey, Enum as SQLEnum, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from datetime import datetime
import enum


class RegistrationStatus(str, enum.Enum):
    """Status of course registration."""
    PENDING = "PENDING"          # Awaiting HOD upload
    UPLOADED = "UPLOADED"        # CSV uploaded, awaiting validation
    VALIDATED = "VALIDATED"      # Data validated, awaiting approval
    APPROVED = "APPROVED"        # Approved by admin
    REJECTED = "REJECTED"        # Rejected - needs reupload


class CourseRegistration(BaseModel):
    """
    Course registration record from HOD CSV upload.
    
    Represents a single row of course registration data:
    USN -> Student -> Course mapping with academic details.
    
    Attributes:
        upload_id: Foreign key to CourseRegistrationUpload batch
        usn: University Seat Number
        student_name: Full name of student
        department_code: Department/branch code (e.g., "CSE", "ECE")
        semester: Semester number (1-8)
        academic_year: Academic year (e.g., "2024-25")
        course_code: Course code (e.g., "CS301")
        course_name: Full course name
        course_type: Type of course (THEORY, LAB, ELECTIVE)
        credits: Number of credits
        exam_duration_minutes: Duration of exam in minutes
        email: Student email (optional from CSV)
        is_valid: Whether this record passed validation
        validation_errors: Comma-separated list of validation errors
        matched_student_id: ID of matched Student record (if any)
        matched_course_id: ID of matched Course record (if any)
    """
    
    __tablename__ = "course_registrations"
    
    # Upload batch reference
    upload_id = Column(Integer, ForeignKey("course_registration_uploads.id"), nullable=False, index=True)
    
    # Student information
    usn = Column(String(20), nullable=False, index=True)
    student_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    
    # Academic information
    department_code = Column(String(10), nullable=False, index=True)
    semester = Column(Integer, nullable=False)
    academic_year = Column(String(20), nullable=False, index=True)
    
    # Course information
    course_code = Column(String(20), nullable=False, index=True)
    course_name = Column(String(255), nullable=False)
    course_type = Column(String(20), nullable=False)  # THEORY, LAB, ELECTIVE
    credits = Column(Integer, default=3)
    exam_duration_minutes = Column(Integer, default=180)
    
    # Validation status
    is_valid = Column(Boolean, default=False, index=True)
    validation_errors = Column(Text, nullable=True)
    
    # Matched records
    matched_student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    matched_course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    
    # Relationships
    upload = relationship("CourseRegistrationUpload", back_populates="registrations")
    matched_student = relationship("Student", foreign_keys=[matched_student_id])
    matched_course = relationship("Course", foreign_keys=[matched_course_id])
    
    def __repr__(self) -> str:
        """String representation."""
        return f"<CourseRegistration(usn={self.usn}, code={self.course_code}, status={'valid' if self.is_valid else 'invalid'})>"
    
    @property
    def display_name(self) -> str:
        """Get display name."""
        return f"{self.student_name} ({self.usn}) - {self.course_code}"
    
    def add_validation_error(self, error: str) -> None:
        """Add a validation error."""
        if self.validation_errors:
            self.validation_errors += f"; {error}"
        else:
            self.validation_errors = error
        self.is_valid = False


class CourseRegistrationUpload(BaseModel):
    """
    Batch of course registrations from a single HOD CSV upload.
    
    Tracks the upload status and metadata for a department's course registration batch.
    
    Attributes:
        hod_id: ID of HOD who uploaded this batch
        department_id: ID of department (for validation)
        status: Current status (PENDING, UPLOADED, VALIDATED, APPROVED, REJECTED)
        file_name: Original CSV file name
        record_count: Total number of records in upload
        valid_count: Number of valid records after validation
        invalid_count: Number of invalid records
        upload_notes: Optional notes from HOD
        validation_notes: Notes from validation process
        rejection_reason: Reason for rejection (if rejected)
        uploaded_at: Timestamp of upload
        validated_at: Timestamp of validation completion
        approved_at: Timestamp of admin approval
    """
    
    __tablename__ = "course_registration_uploads"
    
    # Upload details
    hod_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False, index=True)
    
    # Status tracking
    status = Column(SQLEnum(RegistrationStatus), default=RegistrationStatus.PENDING, nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    
    # Statistics
    record_count = Column(Integer, default=0)
    valid_count = Column(Integer, default=0)
    invalid_count = Column(Integer, default=0)
    
    # Notes
    upload_notes = Column(Text, nullable=True)
    validation_notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Timestamps
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    validated_at = Column(DateTime, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # Relationships
    hod = relationship("User", foreign_keys=[hod_id])
    department = relationship("Department", foreign_keys=[department_id])
    registrations = relationship(
        "CourseRegistration",
        back_populates="upload",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        """String representation."""
        return f"<CourseRegistrationUpload(dept={self.department_id}, status={self.status}, records={self.record_count})>"
    
    @property
    def display_name(self) -> str:
        """Get display name."""
        return f"{self.file_name} ({self.record_count} records, {self.valid_count} valid)"
    
    @property
    def is_complete(self) -> bool:
        """Check if all records are processed."""
        return self.record_count == (self.valid_count + self.invalid_count)
    
    @property
    def validation_percentage(self) -> float:
        """Get percentage of valid records."""
        if self.record_count == 0:
            return 0.0
        return (self.valid_count / self.record_count) * 100
    
    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "department_id": self.department_id,
            "department_name": self.department.name if self.department else None,
            "hod_id": self.hod_id,
            "hod_name": self.hod.full_name if self.hod else None,
            "status": self.status.value,
            "file_name": self.file_name,
            "record_count": self.record_count,
            "valid_count": self.valid_count,
            "invalid_count": self.invalid_count,
            "validation_percentage": self.validation_percentage,
            "upload_notes": self.upload_notes,
            "validation_notes": self.validation_notes,
            "rejection_reason": self.rejection_reason,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "validated_at": self.validated_at.isoformat() if self.validated_at else None,
            "approved_at": self.approved_at.isoformat() if self.approved_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }