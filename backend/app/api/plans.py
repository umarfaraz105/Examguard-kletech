"""Plan management endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User as UserModel, UserRole
from app.models.plan import Plan as PlanModel, PlanStatus
from app.models.schedule import ScheduledExam
from app.models.seating import SeatAssignment
from app.models.invigilator import InvigilatorAssignment
from app.schemas.plan import Plan, PlanCreate, PlanUpdate, PlanWithStats

router = APIRouter()


@router.get("/", response_model=List[PlanWithStats])
def list_plans(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status: PlanStatus = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """List all plans with statistics."""
    query = db.query(PlanModel)
    if status:
        query = query.filter(PlanModel.status == status)
    
    plans = query.offset(skip).limit(limit).all()
    result = []
    for plan in plans:
        scheduled_count = db.query(func.count(ScheduledExam.id)).filter(
            ScheduledExam.plan_id == plan.id
        ).scalar()
        seat_count = db.query(func.count(SeatAssignment.id)).join(
            ScheduledExam
        ).filter(ScheduledExam.plan_id == plan.id).scalar()
        invig_count = db.query(func.count(InvigilatorAssignment.id)).join(
            ScheduledExam
        ).filter(ScheduledExam.plan_id == plan.id).scalar()
        
        result.append(PlanWithStats(
            **plan.__dict__,
            scheduled_exams_count=scheduled_count,
            seat_assignments_count=seat_count,
            invigilator_assignments_count=invig_count
        ))
    return result


@router.get("/{plan_id}", response_model=PlanWithStats)
def get_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get plan by ID with statistics."""
    plan = db.query(PlanModel).filter(PlanModel.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    scheduled_count = db.query(func.count(ScheduledExam.id)).filter(
        ScheduledExam.plan_id == plan.id
    ).scalar()
    seat_count = db.query(func.count(SeatAssignment.id)).join(
        ScheduledExam
    ).filter(ScheduledExam.plan_id == plan.id).scalar()
    invig_count = db.query(func.count(InvigilatorAssignment.id)).join(
        ScheduledExam
    ).filter(ScheduledExam.plan_id == plan.id).scalar()
    
    return PlanWithStats(
        **plan.__dict__,
        scheduled_exams_count=scheduled_count,
        seat_assignments_count=seat_count,
        invigilator_assignments_count=invig_count
    )


@router.post("/", response_model=Plan, status_code=status.HTTP_201_CREATED)
def create_plan(
    plan_in: PlanCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """Create a new exam plan."""
    # Get the latest version for similar plans
    latest_version = db.query(func.max(PlanModel.version)).filter(
        PlanModel.name == plan_in.name
    ).scalar() or 0
    
    db_plan = PlanModel(
        **plan_in.model_dump(),
        version=latest_version + 1,
        created_by_id=current_user.id
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan


@router.patch("/{plan_id}", response_model=Plan)
def update_plan(
    plan_id: int,
    plan_update: PlanUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """Update a plan."""
    plan = db.query(PlanModel).filter(PlanModel.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    if plan.status == PlanStatus.PUBLISHED:
        raise HTTPException(status_code=400, detail="Cannot modify published plan")
    
    update_data = plan_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)
    
    db.commit()
    db.refresh(plan)
    return plan


@router.post("/{plan_id}/approve", response_model=Plan)
def approve_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """Approve a plan."""
    plan = db.query(PlanModel).filter(PlanModel.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    if plan.status != PlanStatus.PENDING_APPROVAL:
        raise HTTPException(status_code=400, detail="Plan not in pending approval status")
    
    plan.approve(current_user.id)
    db.commit()
    db.refresh(plan)
    return plan


@router.post("/{plan_id}/publish", response_model=Plan)
def publish_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """Publish a plan."""
    plan = db.query(PlanModel).filter(PlanModel.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    if plan.status != PlanStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Plan must be approved before publishing")
    
    plan.publish()
    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN]))
):
    """Delete a plan (only if not published)."""
    plan = db.query(PlanModel).filter(PlanModel.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    if plan.status == PlanStatus.PUBLISHED:
        raise HTTPException(status_code=400, detail="Cannot delete published plan")
    
    db.delete(plan)
    db.commit()
    return None
