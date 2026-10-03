"""Invigilator management endpoints."""
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User as UserModel, UserRole
from app.models.invigilator import (
    FacultyAvailability as FacultyAvailabilityModel,
    InvigilatorAssignment as InvigilatorAssignmentModel
)
from app.schemas.invigilator import (
    FacultyAvailability, FacultyAvailabilityCreate,
    InvigilatorAssignment, InvigilatorConfirmation
)

router = APIRouter()


@router.get("/availability", response_model=List[FacultyAvailability])
def list_faculty_availability(
    user_id: int = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """List faculty availability."""
    query = db.query(FacultyAvailabilityModel)
    if user_id:
        query = query.filter(FacultyAvailabilityModel.user_id == user_id)
    return query.all()


@router.post("/availability", response_model=FacultyAvailability, status_code=status.HTTP_201_CREATED)
def create_availability(
    availability_in: FacultyAvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Create faculty availability record."""
    # Faculty can only create their own availability
    if current_user.role == UserRole.FACULTY and availability_in.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Can only set your own availability")
    
    db_availability = FacultyAvailabilityModel(**availability_in.model_dump())
    db.add(db_availability)
    db.commit()
    db.refresh(db_availability)
    return db_availability


@router.get("/assignments", response_model=List[InvigilatorAssignment])
def list_assignments(
    scheduled_exam_id: int = None,
    user_id: int = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """List invigilator assignments."""
    query = db.query(InvigilatorAssignmentModel)
    if scheduled_exam_id:
        query = query.filter(InvigilatorAssignmentModel.scheduled_exam_id == scheduled_exam_id)
    if user_id:
        query = query.filter(InvigilatorAssignmentModel.user_id == user_id)
    elif current_user.role == UserRole.FACULTY:
        # Faculty can only see their own assignments
        query = query.filter(InvigilatorAssignmentModel.user_id == current_user.id)
    
    return query.offset(skip).limit(limit).all()


@router.post("/assignments/{assignment_id}/confirm", response_model=InvigilatorAssignment)
def confirm_assignment(
    assignment_id: int,
    confirmation: InvigilatorConfirmation,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Confirm or decline an invigilator assignment."""
    assignment = db.query(InvigilatorAssignmentModel).filter(
        InvigilatorAssignmentModel.id == assignment_id
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Faculty can only confirm their own assignments
    if current_user.role == UserRole.FACULTY and assignment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Can only confirm your own assignments")
    
    assignment.confirmed = confirmation.confirmed
    assignment.confirmed_at = datetime.utcnow()
    db.commit()
    db.refresh(assignment)
    return assignment
