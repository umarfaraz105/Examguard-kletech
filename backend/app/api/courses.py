"""Course management endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User as UserModel, UserRole
from app.models.course import Course as CourseModel
from app.schemas.course import Course, CourseCreate, CourseUpdate, CourseWithEnrollment

router = APIRouter()


@router.get("/", response_model=List[CourseWithEnrollment])
def list_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    branch: str = None,
    semester: int = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """List all courses with enrollment counts."""
    query = db.query(
        CourseModel,
        func.count(CourseModel.students).label('enrollment_count')
    ).outerjoin(CourseModel.students).group_by(CourseModel.id)
    
    if branch:
        query = query.filter(CourseModel.branch == branch)
    if semester:
        query = query.filter(CourseModel.semester == semester)
    
    results = query.offset(skip).limit(limit).all()
    return [
        CourseWithEnrollment(
            **course.__dict__,
            enrollment_count=count
        )
        for course, count in results
    ]


@router.get("/{course_id}", response_model=Course)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get course by ID."""
    course = db.query(CourseModel).filter(CourseModel.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.post("/", response_model=Course, status_code=status.HTTP_201_CREATED)
def create_course(
    course_in: CourseCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL, UserRole.HOD]))
):
    """Create a new course."""
    # Check for duplicate code
    existing = db.query(CourseModel).filter(CourseModel.code == course_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Course code already exists")
    
    db_course = CourseModel(**course_in.model_dump())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course


@router.patch("/{course_id}", response_model=Course)
def update_course(
    course_id: int,
    course_update: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL, UserRole.HOD]))
):
    """Update a course."""
    course = db.query(CourseModel).filter(CourseModel.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    update_data = course_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)
    
    db.commit()
    db.refresh(course)
    return course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """Delete a course."""
    course = db.query(CourseModel).filter(CourseModel.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return None
