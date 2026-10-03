"""Data extraction API endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.services.data_extraction import DataExtractionService

router = APIRouter()


@router.get("/upload/{upload_id}/extract")
def extract_from_upload(
    upload_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL, UserRole.HOD])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Extract student-course matrix from a specific upload.
    
    Only approved uploads can be extracted.
    HODs can only extract their own department's uploads.
    """
    try:
        service = DataExtractionService(db)
        matrix = service.extract_from_upload(upload_id)
        
        return {
            "upload_id": upload_id,
            "data": matrix.to_dict(),
            "extracted_at": None  # Can add timestamp if needed
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Extraction failed: {str(e)}"
        )


@router.get("/department/{department_id}/extract")
def extract_from_department(
    department_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL, UserRole.HOD])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Extract all approved registrations for a department.
    
    Combines all approved uploads from a department into one matrix.
    """
    try:
        service = DataExtractionService(db)
        matrix = service.extract_from_department(department_id)
        
        return {
            "department_id": department_id,
            "data": matrix.to_dict(),
            "extracted_at": None
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Extraction failed: {str(e)}"
        )


@router.get("/all/extract")
def extract_all(
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Extract ALL approved registrations system-wide.
    
    Only Admin and Staff can access this - it returns the complete
    student-course matrix for scheduling.
    """
    try:
        service = DataExtractionService(db)
        matrix = service.extract_all_approved()
        
        return {
            "scope": "all_departments",
            "data": matrix.to_dict(),
            "extracted_at": None
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Extraction failed: {str(e)}"
        )


@router.post("/upload/{upload_id}/sync")
def sync_upload_to_database(
    upload_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Sync extracted data to Student and Course tables.
    
    Creates missing students and courses from the registration data.
    Only Admin and Staff can sync.
    """
    try:
        service = DataExtractionService(db)
        
        # Extract matrix
        matrix = service.extract_from_upload(upload_id)
        
        # Sync to database
        result = service.sync_to_database(matrix)
        
        return {
            "upload_id": upload_id,
            "students_created": result['students_created'],
            "courses_created": result['courses_created'],
            "message": "Data synced successfully"
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sync failed: {str(e)}"
        )


@router.get("/conflicts")
def get_scheduling_conflicts(
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get scheduling conflicts from all approved registrations.
    
    Returns course pairs that share students and cannot be scheduled
    at the same time.
    """
    try:
        service = DataExtractionService(db)
        matrix = service.extract_all_approved()
        conflicts = matrix.get_conflicts()
        
        return {
            "total_conflicts": len(conflicts),
            "conflicts": conflicts[:100],  # Top 100
            "statistics": matrix.get_statistics()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Conflict detection failed: {str(e)}"
        )


@router.get("/statistics")
def get_extraction_statistics(
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL, UserRole.HOD])),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get overall statistics from extracted data.
    
    Provides summary of students, courses, enrollments, and conflicts.
    """
    try:
        service = DataExtractionService(db)
        matrix = service.extract_all_approved()
        
        return {
            "statistics": matrix.get_statistics(),
            "departments": matrix.get_courses_by_department(),
            "semesters": matrix.get_courses_by_semester(),
            "conflict_count": len(matrix.get_conflicts())
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Statistics failed: {str(e)}"
        )
