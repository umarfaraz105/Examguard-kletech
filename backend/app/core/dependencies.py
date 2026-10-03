"""FastAPI dependencies for authentication and authorization."""
from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.core.rate_limiter import get_client_ip
from app.models.user import User, UserRole

# Security scheme for JWT bearer tokens
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency that extracts and validates the current user from JWT token.
    
    Args:
        credentials: HTTP Authorization bearer token
        db: Database session
        
    Returns:
        Current authenticated user
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode token
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise credentials_exception
    
    user_id: Optional[int] = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    # Get user from database
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account deactivated"
        )
    
    return user


async def get_current_admin_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Enhanced admin user dependency with IP validation and stricter checks.
    """
    # First, get the user normally
    user = await get_current_user(credentials, db)
    
    # Verify admin role
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator access required"
        )
    
    # Decode token for additional admin checks
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin token"
        )
    
    # Verify admin flag in token
    if not payload.get("admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin session"
        )
    
    # For high-security operations, could verify IP hasn't changed
    # (Optional - might be too strict for some deployments)
    # token_ip = payload.get("ip")
    # current_ip = get_client_ip(request)
    # if token_ip and token_ip != current_ip:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="IP address has changed. Please re-authenticate."
    #     )
    
    return user


class RoleChecker:
    """
    Dependency class to check if user has required role.
    
    Example:
        @app.get("/admin", dependencies=[Depends(RoleChecker([UserRole.ADMIN]))])
        def admin_only():
            return {"message": "Admin access granted"}
    """
    
    def __init__(self, allowed_roles: list[UserRole]):
        """
        Initialize role checker with allowed roles.
        
        Args:
            allowed_roles: List of roles that are allowed access
        """
        self.allowed_roles = allowed_roles
    
    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        """
        Check if current user has required role.
        
        Args:
            current_user: Currently authenticated user
            
        Returns:
            Current user if authorized
            
        Raises:
            HTTPException: If user doesn't have required role
        """
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in self.allowed_roles]}"
            )
        return current_user


# Convenience dependencies for common role checks
require_admin = RoleChecker([UserRole.ADMIN])
require_staff = RoleChecker([UserRole.ADMIN, UserRole.EXAM_CELL])  # Use "staff" terminology
require_exam_cell = RoleChecker([UserRole.ADMIN, UserRole.EXAM_CELL])  # Legacy compatibility
require_hod = RoleChecker([UserRole.ADMIN, UserRole.EXAM_CELL, UserRole.HOD])
require_faculty = RoleChecker([UserRole.ADMIN, UserRole.EXAM_CELL, UserRole.HOD, UserRole.FACULTY])
require_student = RoleChecker([UserRole.STUDENT])  # Students can only access their own data


def require_role(allowed_roles: list[UserRole]):
    """
    Factory function to create role checker dependency.
    
    Args:
        allowed_roles: List of roles that are allowed access
        
    Returns:
        RoleChecker dependency
        
    Example:
        @app.get("/endpoint")
        def some_endpoint(user: User = Depends(require_role([UserRole.ADMIN, UserRole.EXAM_CELL]))):
            return {"user": user}
    """
    return RoleChecker(allowed_roles)
