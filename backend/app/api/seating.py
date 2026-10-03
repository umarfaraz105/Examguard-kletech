"""Seating management endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User as UserModel
from app.models.seating import SeatAssignment as SeatAssignmentModel
from app.schemas.seating import SeatAssignment

router = APIRouter()


@router.get("/", response_model=List[SeatAssignment])
def list_seat_assignments(
    scheduled_exam_id: int = None,
    room_id: int = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """List seat assignments with filtering."""
    query = db.query(SeatAssignmentModel)
    if scheduled_exam_id:
        query = query.filter(SeatAssignmentModel.scheduled_exam_id == scheduled_exam_id)
    if room_id:
        query = query.filter(SeatAssignmentModel.room_id == room_id)
    return query.offset(skip).limit(limit).all()


@router.get("/{assignment_id}", response_model=SeatAssignment)
def get_seat_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get seat assignment by ID."""
    assignment = db.query(SeatAssignmentModel).filter(
        SeatAssignmentModel.id == assignment_id
    ).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Seat assignment not found")
    return assignment
