"""Course registration schemas for request/response validation."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class CourseRegistrationBase(BaseModel):
    """Base course registration schema."""
    usn: str = Field(..., min_length=5, max_length=20)
    student_name: str = Field(..., min_length=2, max_length=255)
    department_code: str = Field(..., min_length=2, max_length=10)
    semester: int = Field(..., ge=1, le=8)
    academic_year: str = Field(..., min_length=4, max_length=20)
    course_code: str = Field(..., min_length=2, max_length=20)
    course_name: str = Field(..., min_length=2, max_length=255)
    course_type: str = Field(..., pattern="^(THEORY|LAB|ELECTIVE)$")
    credits: int = Field(default=3, ge=1, le=6)
    exam_duration_minutes: int = Field(default=180, ge=30, le=480)
    email: Optional[str] = None


class CourseRegistration(CourseRegistrationBase):
    """Course registration response schema."""
    id: int
    upload_id: int
    is_valid: bool
    validation_errors: Optional[str]
    matched_student_id: Optional[int]
    matched_course_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CourseRegistrationUploadBase(BaseModel):
    """Base course registration upload schema."""
    file_name: str = Field(..., min_length=3, max_length=255)
    upload_notes: Optional[str] = None


class CourseRegistrationUploadCreate(CourseRegistrationUploadBase):
    """Course registration upload creation schema."""
    pass


class CourseRegistrationUploadResponse(BaseModel):
    """Course registration upload response schema."""
    id: int
    department_id: int
    department_name: Optional[str]
    hod_id: int
    hod_name: Optional[str]
    status: str
    file_name: str
    record_count: int
    valid_count: int
    invalid_count: int
    validation_percentage: float
    upload_notes: Optional[str]
    validation_notes: Optional[str]
    rejection_reason: Optional[str]
    uploaded_at: Optional[datetime]
    validated_at: Optional[datetime]
    approved_at: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class CourseRegistrationUploadSummary(BaseModel):
    """Lightweight upload summary."""
    id: int
    department_code: str
    department_name: str
    status: str
    record_count: int
    valid_count: int
    validation_percentage: float
    uploaded_at: datetime
    hod_name: str

    class Config:
        from_attributes = True


class RegistrationError(BaseModel):
    """Validation error for a single registration."""
    row_number: int
    usn: str
    field: str
    message: str
    error_type: str  # MISSING_FIELD, INVALID_FORMAT, DUPLICATE, UNMATCHED


class RegistrationValidationReport(BaseModel):
    """Report of validation results."""
    upload_id: int
    total_records: int
    valid_records: int
    invalid_records: int
    validation_percentage: float
    errors: List[RegistrationError]
    warnings: List[str]
    unmatched_students: List[str]  # USNs that don't exist in system
    new_courses: List[str]  # Course codes that don't exist in system