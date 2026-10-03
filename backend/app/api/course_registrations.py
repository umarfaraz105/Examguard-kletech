"""Course registration upload endpoints for HODs."""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Response
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.models.department import Department
from app.models.course_registration import CourseRegistration, CourseRegistrationUpload, RegistrationStatus
from app.models.student import Student
from app.models.course import Course
from app.schemas.course_registration import (
    CourseRegistrationUploadResponse,
    CourseRegistrationUploadSummary,
    RegistrationValidationReport,
    RegistrationError
)
from app.services.csv_parser import CSVParser

router = APIRouter()


@router.get("/template")
def download_csv_template():
    """Download CSV template for course registration."""
    template = CSVParser.generate_template()
    return Response(
        content=template,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=course_registration_template.csv"}
    )


@router.post("/upload")
async def upload_course_registration(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> CourseRegistrationUploadResponse:
    """
    Upload course registration CSV file.
    
    Only HODs can upload for their department.
    """
    # Verify HOD role
    if current_user.role != UserRole.HOD:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HODs can upload course registrations"
        )
    
    # Get HOD's department
    hod_dept = db.query(Department).filter(
        Department.hod_id == current_user.id
    ).first()
    
    if not hod_dept:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned as HOD for any department"
        )
    
    try:
        # Read file
        if not file.filename.endswith('.csv'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only CSV files are supported"
            )
        
        file_content = await file.read()
        
        # Parse CSV
        parser = CSVParser()
        records, errors, warnings = parser.parse_file(file_content)
        
        # Create upload record
        upload = CourseRegistrationUpload(
            hod_id=current_user.id,
            department_id=hod_dept.id,
            status=RegistrationStatus.UPLOADED,
            file_name=file.filename,
            record_count=len(records),
            upload_notes=None
        )
        db.add(upload)
        db.flush()  # Get upload ID without committing
        
        # Store registration records
        valid_count = 0
        invalid_count = 0
        
        for record in records:
            # Validate department code matches HOD's department
            if record['department_code'] != hod_dept.code:
                record['validation_errors'] = f"Department mismatch: expected {hod_dept.code}, got {record['department_code']}"
                record['is_valid'] = False
            
            reg = CourseRegistration(
                upload_id=upload.id,
                usn=record['usn'],
                student_name=record['student_name'],
                email=record.get('email'),
                department_code=record['department_code'],
                semester=record['semester'],
                academic_year=record['academic_year'],
                course_code=record['course_code'],
                course_name=record['course_name'],
                course_type=record['course_type'],
                credits=record.get('credits', 3),
                exam_duration_minutes=record.get('exam_duration_minutes', 180),
                is_valid=record['is_valid'],
                validation_errors=record.get('validation_errors')
            )
            
            if record['is_valid']:
                valid_count += 1
            else:
                invalid_count += 1
            
            db.add(reg)
        
        # Update upload counts
        upload.valid_count = valid_count
        upload.invalid_count = invalid_count
        
        db.commit()
        db.refresh(upload)
        
        return CourseRegistrationUploadResponse(
            id=upload.id,
            department_id=upload.department_id,
            department_name=hod_dept.name,
            hod_id=upload.hod_id,
            hod_name=current_user.full_name,
            status=upload.status.value,
            file_name=upload.file_name,
            record_count=upload.record_count,
            valid_count=upload.valid_count,
            invalid_count=upload.invalid_count,
            validation_percentage=upload.validation_percentage,
            upload_notes=upload.upload_notes,
            validation_notes=None,
            rejection_reason=None,
            uploaded_at=upload.uploaded_at,
            validated_at=upload.validated_at,
            approved_at=upload.approved_at,
            created_at=upload.created_at,
            updated_at=upload.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )


@router.get("/uploads")
def list_uploads(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> List[CourseRegistrationUploadSummary]:
    """
    List course registration uploads.
    
    HODs see only their uploads, Admins see all.
    """
    query = db.query(CourseRegistrationUpload)
    
    # Filter by role
    if current_user.role == UserRole.HOD:
        query = query.filter(CourseRegistrationUpload.hod_id == current_user.id)
    elif current_user.role != UserRole.ADMIN and current_user.role != UserRole.EXAM_CELL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    uploads = query.order_by(CourseRegistrationUpload.uploaded_at.desc()).all()
    
    result = []
    for upload in uploads:
        dept = db.query(Department).filter(Department.id == upload.department_id).first()
        hod = db.query(User).filter(User.id == upload.hod_id).first()
        
        result.append(CourseRegistrationUploadSummary(
            id=upload.id,
            department_code=dept.code if dept else "Unknown",
            department_name=dept.name if dept else "Unknown",
            status=upload.status.value,
            record_count=upload.record_count,
            valid_count=upload.valid_count,
            validation_percentage=upload.validation_percentage,
            uploaded_at=upload.uploaded_at,
            hod_name=hod.full_name if hod else "Unknown"
        ))
    
    return result


@router.get("/uploads/{upload_id}/report")
def get_validation_report(
    upload_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> RegistrationValidationReport:
    """Get detailed validation report for an upload."""
    upload = db.query(CourseRegistrationUpload).filter(
        CourseRegistrationUpload.id == upload_id
    ).first()
    
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    # Authorization check
    if current_user.role == UserRole.HOD and upload.hod_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    registrations = db.query(CourseRegistration).filter(
        CourseRegistration.upload_id == upload_id
    ).all()
    
    errors = []
    unmatched_students = []
    new_courses = []
    
    for reg in registrations:
        if not reg.is_valid:
            # Parse validation errors
            error_msgs = reg.validation_errors.split("; ") if reg.validation_errors else []
            for msg in error_msgs:
                errors.append(RegistrationError(
                    row_number=0,
                    usn=reg.usn,
                    field="registration",
                    message=msg,
                    error_type="INVALID_FORMAT"
                ))
        
        # Check for unmatched students
        if not db.query(Student).filter(Student.usn == reg.usn).first():
            if reg.usn not in unmatched_students:
                unmatched_students.append(reg.usn)
        
        # Check for new courses
        if not db.query(Course).filter(Course.course_code == reg.course_code).first():
            if reg.course_code not in new_courses:
                new_courses.append(reg.course_code)
    
    return RegistrationValidationReport(
        upload_id=upload_id,
        total_records=upload.record_count,
        valid_records=upload.valid_count,
        invalid_records=upload.invalid_count,
        validation_percentage=upload.validation_percentage,
        errors=errors,
        warnings=[],
        unmatched_students=unmatched_students,
        new_courses=new_courses
    )


@router.post("/uploads/{upload_id}/validate")
def validate_upload(
    upload_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL])),
    db: Session = Depends(get_db)
) -> CourseRegistrationUploadResponse:
    """
    Validate an uploaded CSV file.
    Only Admin/Staff can validate.
    """
    upload = db.query(CourseRegistrationUpload).filter(
        CourseRegistrationUpload.id == upload_id
    ).first()
    
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    if upload.status != RegistrationStatus.UPLOADED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can only validate UPLOADED files, this is {upload.status.value}"
        )
    
    upload.status = RegistrationStatus.VALIDATED
    upload.validated_at = datetime.utcnow()
    db.commit()
    db.refresh(upload)
    
    dept = db.query(Department).filter(Department.id == upload.department_id).first()
    hod = db.query(User).filter(User.id == upload.hod_id).first()
    
    return CourseRegistrationUploadResponse(
        id=upload.id,
        department_id=upload.department_id,
        department_name=dept.name if dept else None,
        hod_id=upload.hod_id,
        hod_name=hod.full_name if hod else None,
        status=upload.status.value,
        file_name=upload.file_name,
        record_count=upload.record_count,
        valid_count=upload.valid_count,
        invalid_count=upload.invalid_count,
        validation_percentage=upload.validation_percentage,
        upload_notes=upload.upload_notes,
        validation_notes=upload.validation_notes,
        rejection_reason=upload.rejection_reason,
        uploaded_at=upload.uploaded_at,
        validated_at=upload.validated_at,
        approved_at=upload.approved_at,
        created_at=upload.created_at,
        updated_at=upload.updated_at
    )


@router.post("/uploads/{upload_id}/approve")
def approve_upload(
    upload_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL])),
    db: Session = Depends(get_db)
) -> CourseRegistrationUploadResponse:
    """
    Approve a validated upload.
    Only Admin/Staff can approve.
    """
    upload = db.query(CourseRegistrationUpload).filter(
        CourseRegistrationUpload.id == upload_id
    ).first()
    
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    if upload.status != RegistrationStatus.VALIDATED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can only approve VALIDATED uploads, this is {upload.status.value}"
        )
    
    upload.status = RegistrationStatus.APPROVED
    upload.approved_at = datetime.utcnow()
    db.commit()
    db.refresh(upload)
    
    dept = db.query(Department).filter(Department.id == upload.department_id).first()
    hod = db.query(User).filter(User.id == upload.hod_id).first()
    
    return CourseRegistrationUploadResponse(
        id=upload.id,
        department_id=upload.department_id,
        department_name=dept.name if dept else None,
        hod_id=upload.hod_id,
        hod_name=hod.full_name if hod else None,
        status=upload.status.value,
        file_name=upload.file_name,
        record_count=upload.record_count,
        valid_count=upload.valid_count,
        invalid_count=upload.invalid_count,
        validation_percentage=upload.validation_percentage,
        upload_notes=upload.upload_notes,
        validation_notes=upload.validation_notes,
        rejection_reason=upload.rejection_reason,
        uploaded_at=upload.uploaded_at,
        validated_at=upload.validated_at,
        approved_at=upload.approved_at,
        created_at=upload.created_at,
        updated_at=upload.updated_at
    )


@router.post("/uploads/{upload_id}/reject")
def reject_upload(
    upload_id: int,
    rejection_reason: str,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL])),
    db: Session = Depends(get_db)
) -> CourseRegistrationUploadResponse:
    """
    Reject an upload.
    Only Admin/Staff can reject.
    """
    upload = db.query(CourseRegistrationUpload).filter(
        CourseRegistrationUpload.id == upload_id
    ).first()
    
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    upload.status = RegistrationStatus.REJECTED
    upload.rejection_reason = rejection_reason
    db.commit()
    db.refresh(upload)
    
    dept = db.query(Department).filter(Department.id == upload.department_id).first()
    hod = db.query(User).filter(User.id == upload.hod_id).first()
    
    return CourseRegistrationUploadResponse(
        id=upload.id,
        department_id=upload.department_id,
        department_name=dept.name if dept else None,
        hod_id=upload.hod_id,
        hod_name=hod.full_name if hod else None,
        status=upload.status.value,
        file_name=upload.file_name,
        record_count=upload.record_count,
        valid_count=upload.valid_count,
        invalid_count=upload.invalid_count,
        validation_percentage=upload.validation_percentage,
        upload_notes=upload.upload_notes,
        validation_notes=upload.validation_notes,
        rejection_reason=upload.rejection_reason,
        uploaded_at=upload.uploaded_at,
        validated_at=upload.validated_at,
        approved_at=upload.approved_at,
        created_at=upload.created_at,
        updated_at=upload.updated_at
    )