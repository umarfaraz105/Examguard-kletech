"""Student management endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User as UserModel, UserRole
from app.models.student import Student as StudentModel
from app.models.course import Course as CourseModel
from app.schemas.student import Student, StudentCreate, StudentUpdate, StudentWithCourses, StudentCourseEnrollment

router = APIRouter()


@router.get("/", response_model=List[StudentWithCourses])
def list_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    branch: str = None,
    semester: int = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """List all students with course counts."""
    query = db.query(
        StudentModel,
        func.count(StudentModel.courses).label('course_count')
    ).outerjoin(StudentModel.courses).group_by(StudentModel.id)
    
    if branch:
        query = query.filter(StudentModel.branch == branch)
    if semester:
        query = query.filter(StudentModel.semester == semester)
    
    results = query.offset(skip).limit(limit).all()
    return [
        StudentWithCourses(
            **student.__dict__,
            course_count=count
        )
        for student, count in results
    ]


@router.get("/{student_id}", response_model=Student)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Get student by ID."""
    student = db.query(StudentModel).filter(StudentModel.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.post("/", response_model=Student, status_code=status.HTTP_201_CREATED)
def create_student(
    student_in: StudentCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """Create a new student."""
    # Check for duplicate USN
    existing = db.query(StudentModel).filter(StudentModel.usn == student_in.usn).first()
    if existing:
        raise HTTPException(status_code=400, detail="USN already exists")
    
    # Create student without courses first
    student_data = student_in.model_dump(exclude={'course_ids'})
    db_student = StudentModel(**student_data)
    
    # Add courses if provided
    if student_in.course_ids:
        courses = db.query(CourseModel).filter(CourseModel.id.in_(student_in.course_ids)).all()
        db_student.courses = courses
    
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


@router.patch("/{student_id}", response_model=Student)
def update_student(
    student_id: int,
    student_update: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """Update a student."""
    student = db.query(StudentModel).filter(StudentModel.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    update_data = student_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)
    
    db.commit()
    db.refresh(student)
    return student


@router.post("/{student_id}/enroll", response_model=Student)
def enroll_student(
    student_id: int,
    enrollment: StudentCourseEnrollment,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """Enroll student in courses."""
    student = db.query(StudentModel).filter(StudentModel.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    courses = db.query(CourseModel).filter(CourseModel.id.in_(enrollment.course_ids)).all()
    if len(courses) != len(enrollment.course_ids):
        raise HTTPException(status_code=404, detail="One or more courses not found")
    
    student.courses = courses
    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """Delete a student."""
    student = db.query(StudentModel).filter(StudentModel.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
    return None
