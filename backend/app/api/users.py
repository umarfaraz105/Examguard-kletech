"""User management endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.user import User as UserModel, UserRole
from app.schemas.user import User, UserCreate, UserUpdate
from app.core.security import get_password_hash

router = APIRouter()


@router.get("/", response_model=List[User])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    role: UserRole = None,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))
):
    """
    List all users with optional filtering.
    Admin or Exam Cell access required.
    """
    query = db.query(UserModel)
    if role:
        query = query.filter(UserModel.role == role)
    users = query.offset(skip).limit(limit).all()
    return users


@router.get("/{user_id}", response_model=User)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Get user by ID.
    Users can view their own profile, admins can view all.
    """
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Allow users to view their own profile, or admins to view any
    if current_user.id != user_id and current_user.role not in [UserRole.ADMIN, UserRole.EXAM_CELL]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user"
        )
    
    return user


@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN]))
):
    """
    Create a new user.
    Admin access required.
    """
    # Check if user already exists
    existing = db.query(UserModel).filter(UserModel.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    db_user = UserModel(
        email=user_in.email,
        full_name=user_in.full_name,
        employee_id=user_in.employee_id,
        department=user_in.department,
        role=user_in.role,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.patch("/{user_id}", response_model=User)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    Update user information.
    Users can update their own profile (except role), admins can update any.
    """
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check permissions
    is_self = current_user.id == user_id
    is_admin = current_user.role == UserRole.ADMIN
    
    if not is_self and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )
    
    # Non-admins cannot change role
    if user_update.role is not None and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to change user role"
        )
    
    # Update fields
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_role([UserRole.ADMIN]))
):
    """
    Delete a user (soft delete by deactivating).
    Admin access required.
    """
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Soft delete
    user.is_active = False
    db.commit()
    return None
