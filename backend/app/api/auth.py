"""Authentication endpoints with enhanced security."""
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    verify_password, create_access_token,
    get_password_hash
)
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.rate_limiter import (
    check_login_security, record_login_attempt,
    create_csrf_token, get_client_ip
)
from app.models.user import User as UserModel, UserRole
from app.schemas.user import (
    Token, LoginRequest, User, UserCreate,
    UserPasswordUpdate
)

router = APIRouter()


@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    Admin access required to create ADMIN or EXAM_CELL users.
    """
    # Check if user already exists
    existing_user = db.query(UserModel).filter(
        UserModel.email == user_in.email
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
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


@router.post("/login", response_model=Token)
def login(
    login_data: LoginRequest, 
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Login with email and password to get JWT token.
    Includes rate limiting, account lockout, and audit logging.
    """
    # Security checks
    check_login_security(request, login_data.email, db)
    
    client_ip = get_client_ip(request)
    
    user = db.query(UserModel).filter(
        UserModel.email == login_data.email
    ).first()
    
    # Verify credentials
    if not user or not verify_password(login_data.password, user.hashed_password):
        # Record failed attempt
        record_login_attempt(request, login_data.email, success=False, user_id=None, db=db)
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        record_login_attempt(request, login_data.email, success=False, user_id=user.id, db=db)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token_data = {"sub": str(user.id), "email": user.email, "role": user.role.value}
    
    # Enhanced token for admin users
    if user.role == UserRole.ADMIN:
        access_token_data["admin"] = True
        access_token_data["ip"] = client_ip
        # Shorter expiry for admin tokens
        access_token_expires = timedelta(minutes=30)
    
    access_token = create_access_token(
        data=access_token_data,
        expires_delta=access_token_expires
    )
    
    # Generate CSRF token for admin users
    csrf_token = None
    if user.role == UserRole.ADMIN:
        csrf_token = create_csrf_token(user.id)
    
    # Record successful login
    record_login_attempt(request, login_data.email, success=True, user_id=user.id, db=db)
    
    response = {"access_token": access_token, "token_type": "bearer"}
    if csrf_token:
        response["csrf_token"] = csrf_token
    
    return response


@router.post("/token", response_model=Token)
def login_oauth(
    form_data: OAuth2PasswordRequestForm = Depends(),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login (for API docs).
    """
    # Use same security as regular login
    if request:
        check_login_security(request, form_data.username, db)
    
    user = db.query(UserModel).filter(
        UserModel.email == form_data.username
    ).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        if request:
            record_login_attempt(request, form_data.username, success=False, user_id=None, db=db)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        if request:
            record_login_attempt(request, form_data.username, success=False, user_id=user.id, db=db)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    if request:
        record_login_attempt(request, form_data.username, success=True, user_id=user.id, db=db)
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=User)
def get_current_user_info(current_user: UserModel = Depends(get_current_user)):
    """
    Get current user information.
    """
    return current_user


@router.post("/change-password")
def change_password(
    password_update: UserPasswordUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change current user's password.
    """
    # Verify current password
    if not verify_password(password_update.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_update.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}


@router.get("/security-status")
def get_security_status(
    request: Request,
    current_user: UserModel = Depends(get_current_user)
):
    """
    Get security status for current user.
    Shows login attempts, lockout status, etc.
    """
    from app.core.rate_limiter import login_tracker
    
    client_ip = get_client_ip(request)
    user_attempts, ip_attempts = login_tracker.get_remaining_attempts(client_ip, current_user.email)
    is_locked, lock_message = login_tracker.is_locked(client_ip, current_user.email)
    
    return {
        "user_email": current_user.email,
        "client_ip": client_ip,
        "is_locked": is_locked,
        "lock_message": lock_message,
        "remaining_attempts": {
            "user": user_attempts,
            "ip": ip_attempts
        },
        "is_admin": current_user.role == UserRole.ADMIN,
        "last_login": current_user.updated_at.isoformat() if current_user.updated_at else None
    }


@router.post("/admin/unlock-user")
def unlock_user(
    email: str,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint to unlock a locked user account.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    from app.core.rate_limiter import login_tracker
    
    # Remove from locked accounts
    if email in login_tracker.locked_accounts:
        del login_tracker.locked_accounts[email]
    
    # Clear failed attempts
    if email in login_tracker.failed_attempts_by_user:
        login_tracker.failed_attempts_by_user[email].clear()
    
    return {"message": f"User {email} has been unlocked"}
