"""Rate limiting and login security for ExamGuard."""
import time
from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict, deque
import hashlib
from fastapi import HTTPException, Request, status
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog, AuditAction, AuditEntity
from app.models.user import User


class LoginAttemptTracker:
    """Track login attempts and implement account lockout."""
    
    def __init__(self):
        # Track failed attempts per IP and per user
        self.failed_attempts_by_ip: Dict[str, deque] = defaultdict(lambda: deque())
        self.failed_attempts_by_user: Dict[str, deque] = defaultdict(lambda: deque())
        
        # Track locked accounts
        self.locked_accounts: Dict[str, datetime] = {}
        self.locked_ips: Dict[str, datetime] = {}
        
        # Configuration
        self.MAX_ATTEMPTS_PER_USER = 3
        self.MAX_ATTEMPTS_PER_IP = 10
        self.LOCKOUT_DURATION = timedelta(minutes=30)
        self.ATTEMPT_WINDOW = timedelta(minutes=15)
    
    def record_failed_attempt(self, ip_address: str, email: str, db: Session) -> None:
        """Record a failed login attempt."""
        now = datetime.utcnow()
        
        # Clean old attempts
        self._clean_old_attempts(ip_address, email, now)
        
        # Record new attempt
        self.failed_attempts_by_ip[ip_address].append(now)
        self.failed_attempts_by_user[email].append(now)
        
        # Check if lockout needed
        if len(self.failed_attempts_by_user[email]) >= self.MAX_ATTEMPTS_PER_USER:
            self.locked_accounts[email] = now + self.LOCKOUT_DURATION
        
        if len(self.failed_attempts_by_ip[ip_address]) >= self.MAX_ATTEMPTS_PER_IP:
            self.locked_ips[ip_address] = now + self.LOCKOUT_DURATION
        
        # Log security event
        self._log_security_event(
            ip_address=ip_address,
            email=email,
            action="failed_login_attempt",
            db=db
        )
    
    def record_successful_login(self, ip_address: str, email: str, user_id: int, db: Session) -> None:
        """Record a successful login and clear failed attempts."""
        # Clear failed attempts for this user and IP
        if email in self.failed_attempts_by_user:
            self.failed_attempts_by_user[email].clear()
        
        if ip_address in self.failed_attempts_by_ip:
            # Don't clear IP attempts completely, just reduce them
            attempts = self.failed_attempts_by_ip[ip_address]
            if len(attempts) > 3:
                # Keep only recent attempts
                while len(attempts) > 3:
                    attempts.popleft()
        
        # Remove from locked accounts
        if email in self.locked_accounts:
            del self.locked_accounts[email]
        
        # Log successful login
        self._log_security_event(
            ip_address=ip_address,
            email=email,
            action="successful_login",
            user_id=user_id,
            db=db
        )
    
    def is_locked(self, ip_address: str, email: str) -> Tuple[bool, Optional[str]]:
        """Check if account or IP is locked."""
        now = datetime.utcnow()
        
        # Clean expired locks
        self._clean_expired_locks(now)
        
        # Check user lockout
        if email in self.locked_accounts:
            lock_time = self.locked_accounts[email]
            remaining = (lock_time - now).total_seconds()
            if remaining > 0:
                return True, f"Account locked for {int(remaining/60)} more minutes due to multiple failed attempts"
        
        # Check IP lockout
        if ip_address in self.locked_ips:
            lock_time = self.locked_ips[ip_address]
            remaining = (lock_time - now).total_seconds()
            if remaining > 0:
                return True, f"IP address locked for {int(remaining/60)} more minutes due to suspicious activity"
        
        return False, None
    
    def get_remaining_attempts(self, ip_address: str, email: str) -> Tuple[int, int]:
        """Get remaining attempts for user and IP."""
        now = datetime.utcnow()
        self._clean_old_attempts(ip_address, email, now)
        
        user_attempts = len(self.failed_attempts_by_user[email])
        ip_attempts = len(self.failed_attempts_by_ip[ip_address])
        
        user_remaining = max(0, self.MAX_ATTEMPTS_PER_USER - user_attempts)
        ip_remaining = max(0, self.MAX_ATTEMPTS_PER_IP - ip_attempts)
        
        return user_remaining, ip_remaining
    
    def _clean_old_attempts(self, ip_address: str, email: str, now: datetime) -> None:
        """Remove attempts outside the time window."""
        cutoff = now - self.ATTEMPT_WINDOW
        
        # Clean user attempts
        user_attempts = self.failed_attempts_by_user[email]
        while user_attempts and user_attempts[0] < cutoff:
            user_attempts.popleft()
        
        # Clean IP attempts
        ip_attempts = self.failed_attempts_by_ip[ip_address]
        while ip_attempts and ip_attempts[0] < cutoff:
            ip_attempts.popleft()
    
    def _clean_expired_locks(self, now: datetime) -> None:
        """Remove expired locks."""
        expired_accounts = [
            email for email, unlock_time in self.locked_accounts.items()
            if now >= unlock_time
        ]
        for email in expired_accounts:
            del self.locked_accounts[email]
        
        expired_ips = [
            ip for ip, unlock_time in self.locked_ips.items()
            if now >= unlock_time
        ]
        for ip in expired_ips:
            del self.locked_ips[ip]
    
    def _log_security_event(self, ip_address: str, email: str, action: str, 
                          user_id: Optional[int] = None, db: Session = None) -> None:
        """Log security-related events."""
        if db is None:
            return
        
        try:
            audit_log = AuditLog(
                user_id=user_id,
                action=AuditAction.LOGIN_ATTEMPT if "login" in action else AuditAction.SECURITY_EVENT,
                entity_type=AuditEntity.USER,
                entity_id=user_id,
                details={
                    "ip_address": ip_address,
                    "email": email,
                    "action": action,
                    "timestamp": datetime.utcnow().isoformat(),
                    "user_agent": getattr(db, '_request_user_agent', None)
                }
            )
            db.add(audit_log)
            db.commit()
        except Exception as e:
            # Don't fail the request if audit logging fails
            print(f"Audit logging failed: {e}")


class RateLimiter:
    """General purpose rate limiter."""
    
    def __init__(self):
        self.requests: Dict[str, deque] = defaultdict(lambda: deque())
    
    def is_allowed(self, key: str, limit: int, window: timedelta) -> bool:
        """Check if request is within rate limit."""
        now = datetime.utcnow()
        cutoff = now - window
        
        # Clean old requests
        requests = self.requests[key]
        while requests and requests[0] < cutoff:
            requests.popleft()
        
        # Check limit
        if len(requests) >= limit:
            return False
        
        # Record this request
        requests.append(now)
        return True


# Global instances
login_tracker = LoginAttemptTracker()
rate_limiter = RateLimiter()


def get_client_ip(request: Request) -> str:
    """Extract client IP address from request."""
    # Check for forwarded headers first
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fallback to direct client IP
    return request.client.host if request.client else "unknown"


def check_rate_limit(request: Request, limit: int = 100, window_minutes: int = 15) -> None:
    """Check if request is within rate limit."""
    client_ip = get_client_ip(request)
    window = timedelta(minutes=window_minutes)
    
    if not rate_limiter.is_allowed(client_ip, limit, window):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Maximum {limit} requests per {window_minutes} minutes."
        )


def check_login_security(request: Request, email: str, db: Session) -> None:
    """Check login security constraints."""
    client_ip = get_client_ip(request)
    
    # Check if locked
    is_locked, lock_message = login_tracker.is_locked(client_ip, email)
    if is_locked:
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=lock_message
        )
    
    # Check general rate limit (stricter for login endpoints)
    check_rate_limit(request, limit=20, window_minutes=15)


def record_login_attempt(request: Request, email: str, success: bool, user_id: Optional[int], db: Session) -> None:
    """Record login attempt for security tracking."""
    client_ip = get_client_ip(request)
    
    if success and user_id:
        login_tracker.record_successful_login(client_ip, email, user_id, db)
    else:
        login_tracker.record_failed_attempt(client_ip, email, db)


def create_csrf_token(user_id: int) -> str:
    """Create CSRF token for user session."""
    timestamp = str(int(time.time()))
    data = f"{user_id}:{timestamp}"
    # In production, use a secret key from configuration
    secret = "your-csrf-secret-key-here"  # TODO: Move to config
    
    token_hash = hashlib.sha256(f"{data}:{secret}".encode()).hexdigest()
    return f"{timestamp}.{token_hash}"


def verify_csrf_token(user_id: int, token: str, max_age: int = 3600) -> bool:
    """Verify CSRF token validity."""
    try:
        if "." not in token:
            return False
        
        timestamp_str, token_hash = token.split(".", 1)
        timestamp = int(timestamp_str)
        
        # Check age
        if time.time() - timestamp > max_age:
            return False
        
        # Verify hash
        data = f"{user_id}:{timestamp_str}"
        secret = "your-csrf-secret-key-here"  # TODO: Move to config
        expected_hash = hashlib.sha256(f"{data}:{secret}".encode()).hexdigest()
        
        return token_hash == expected_hash
    except (ValueError, TypeError):
        return False