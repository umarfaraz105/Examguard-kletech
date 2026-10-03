"""Schedule management endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User as UserModel
from app.models.schedule import ScheduledExam as ScheduledExamModel
from app.schemas.schedule import ScheduledExam, ScheduledExamWithDetails

router = APIRouter()


@router.get("/", response_model=List[ScheduledExam])
def list_scheduled_exams(
    plan_id: int = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """List all scheduled exams."""
    query = db.query(ScheduledExamModel)
    if plan_id:
        query = query.filter(ScheduledExamModel.plan_id == plan_id)
    return query.offset(skip).limit(limit).all()


@router.get("/{exam_id}", response_model=ScheduledExam)
def get_scheduled_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get scheduled exam by ID."""
    exam = db.query(ScheduledExamModel).filter(ScheduledExamModel.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Scheduled exam not found")
    return exam
