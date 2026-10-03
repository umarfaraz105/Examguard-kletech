"""Main FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.middleware import SecurityMiddleware, AuditMiddleware, RateLimitMiddleware

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Intelligent Multi-Engine Examination Management System",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add security middleware (order matters - first added = outermost)
app.add_middleware(SecurityMiddleware)
app.add_middleware(AuditMiddleware) 
app.add_middleware(RateLimitMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """Initialize application on startup."""
    # Register engines with the engine registry
    from app.core.engine_registry import engine_registry
    from app.services.engine1 import Engine1SchedulingEngine
    from app.services.engine2 import Engine2RoomSeatingEngine
    from app.services.engine3 import Engine3InvigilatorEngine
    
    # Register Engine 1
    engine1 = Engine1SchedulingEngine()
    engine_registry.register(engine1)
    
    # Register Engine 2
    engine2 = Engine2RoomSeatingEngine()
    engine_registry.register(engine2)
    
    # Register Engine 3
    engine3 = Engine3InvigilatorEngine()
    engine_registry.register(engine3)
    
    engines = engine_registry.list_engines(include_metadata=False)
    engine_names = [engine["name"] for engine in engines]
    print(f"Registered engines: {engine_names}")
    engine_registry.set_initialized()


@app.get("/")
async def root():
    """Root endpoint - health check."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}


# Include API routers
from app.api import api_router
app.include_router(api_router, prefix="/api")
