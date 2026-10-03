"""Base model class for all SQLAlchemy models."""
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class TimestampMixin:
    """Mixin to add created_at and updated_at timestamps to models."""
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow, 
        nullable=False
    )


class BaseModel(Base, TimestampMixin):
    """
    Base model class with common fields.
    
    Provides:
    - id: Primary key
    - created_at: Record creation timestamp
    - updated_at: Record update timestamp
    """
    
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)


# Import all models to ensure they're registered with Base.metadata
# This is required for Alembic auto-generation
def import_all_models():
    """Import all models to register them with SQLAlchemy."""
    from app.models import (
        user, rule, course, student, room, 
        plan, schedule, seating, invigilator, audit_log
    )


import_all_models()
