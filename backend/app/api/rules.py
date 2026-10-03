"""Rule management endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User as UserModel, UserRole
from app.models.rule import Rule as RuleModel, RuleCategory
from app.schemas.rule import Rule, RuleCreate, RuleUpdate

router = APIRouter()


@router.get("/", response_model=List[Rule])
def list_rules(
    category: RuleCategory = None,
    exam_type: str = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """List all rules with optional filtering."""
    query = db.query(RuleModel)
    if category:
        query = query.filter(RuleModel.category == category)
    if exam_type:
        query = query.filter(RuleModel.exam_type == exam_type)
    return query.all()


@router.get("/{rule_id}", response_model=Rule)
def get_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get rule by ID."""
    rule = db.query(RuleModel).filter(RuleModel.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    return rule


@router.post("/", response_model=Rule, status_code=status.HTTP_201_CREATED)
def create_rule(
    rule_in: RuleCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """Create a new rule. Admin or Exam Cell access required."""
    db_rule = RuleModel(**rule_in.model_dump())
    db.add(db_rule)
    db.commit()
    db.refresh(db_rule)
    return db_rule


@router.patch("/{rule_id}", response_model=Rule)
def update_rule(
    rule_id: int,
    rule_update: RuleUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """Update a rule. Admin or Exam Cell access required."""
    rule = db.query(RuleModel).filter(RuleModel.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    update_data = rule_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(rule, field, value)
    
    db.commit()
    db.refresh(rule)
    return rule


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN]))
):
    """Delete a rule. Admin access required."""
    rule = db.query(RuleModel).filter(RuleModel.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    db.delete(rule)
    db.commit()
    return None
