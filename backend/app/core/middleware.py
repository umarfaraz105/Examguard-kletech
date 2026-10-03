"""Custom middleware for ExamGuard security and logging."""
from typing import Callable, Any
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import time
import uuid
from datetime import datetime

from app.core.rate_limiter import get_client_ip


class SecurityMiddleware(BaseHTTPMiddleware):
    """Middleware for security headers and request tracking."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate request ID for tracking
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Add client IP and user agent to request state for audit logging
        request.state.client_ip = get_client_ip(request)
        request.state.user_agent = request.headers.get("user-agent", "unknown")
        request.state.start_time = time.time()
        
        # Process request
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Add CORS headers for admin endpoints
        if request.url.path.startswith("/api/auth") or request.url.path.startswith("/admin"):
            response.headers["Access-Control-Allow-Credentials"] = "true"
        
        # Calculate and log request duration
        duration = time.time() - request.state.start_time
        response.headers["X-Response-Time"] = f"{duration:.3f}s"
        
        return response


class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware for audit logging of sensitive operations."""
    
    # Sensitive endpoints that should be audited
    AUDIT_PATTERNS = [
        "/api/auth/login",
        "/api/auth/admin",
        "/api/users",
        "/api/plans",
        "/api/engines"
    ]
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Check if this request should be audited
        should_audit = any(
            request.url.path.startswith(pattern) 
            for pattern in self.AUDIT_PATTERNS
        )
        
        if should_audit:
            # Store request details for potential audit logging
            request.state.audit_data = {
                "method": request.method,
                "path": request.url.path,
                "query_params": dict(request.query_params),
                "timestamp": datetime.utcnow().isoformat(),
                "client_ip": getattr(request.state, "client_ip", "unknown"),
                "user_agent": getattr(request.state, "user_agent", "unknown")
            }
        
        response = await call_next(request)
        
        # Log audit trail for failed authentication attempts
        if (should_audit and 
            request.url.path.endswith("/login") and 
            response.status_code >= 400):
            
            # This will be handled by the login endpoint's security logging
            pass
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware for general rate limiting."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        from app.core.rate_limiter import rate_limiter
        from datetime import timedelta
        
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        client_ip = get_client_ip(request)
        
        # General rate limit: 1000 requests per hour per IP
        if not rate_limiter.is_allowed(f"general:{client_ip}", 1000, timedelta(hours=1)):
            return Response(
                content='{"detail":"Rate limit exceeded. Too many requests."}',
                status_code=429,
                headers={"Content-Type": "application/json"}
            )
        
        # Stricter limits for authentication endpoints
        if request.url.path.startswith("/api/auth"):
            if not rate_limiter.is_allowed(f"auth:{client_ip}", 50, timedelta(minutes=15)):
                return Response(
                    content='{"detail":"Authentication rate limit exceeded."}',
                    status_code=429,
                    headers={"Content-Type": "application/json"}
                )
        
        return await call_next(request)