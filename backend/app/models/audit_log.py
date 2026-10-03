"""Audit log model for tracking all system changes."""
from sqlalchemy import Column, String, Integer, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum
import json


class AuditAction(str, enum.Enum):
    """Audit action types."""
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    APPROVE = "APPROVE"
    PUBLISH = "PUBLISH"
    ARCHIVE = "ARCHIVE"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    ASSIGN = "ASSIGN"
    UNASSIGN = "UNASSIGN"


class AuditEntity(str, enum.Enum):
    """Entity types that can be audited."""
    USER = "USER"
    COURSE = "COURSE"
    STUDENT = "STUDENT"
    ROOM = "ROOM"
    RULE = "RULE"
    PLAN = "PLAN"
    SCHEDULED_EXAM = "SCHEDULED_EXAM"
    SEAT_ASSIGNMENT = "SEAT_ASSIGNMENT"
    INVIGILATOR_ASSIGNMENT = "INVIGILATOR_ASSIGNMENT"
    SYSTEM = "SYSTEM"


class AuditLog(BaseModel):
    """
    Audit log model for complete system traceability.
    
    Records every significant action in the system for:
    - Security and compliance
    - Debugging and troubleshooting
    - Historical analysis
    - Accountability
    
    Attributes:
        user_id: User who performed the action (NULL for system actions)
        action: Type of action performed
        entity_type: Type of entity affected
        entity_id: ID of the affected entity
        description: Human-readable description
        old_values: Previous state (JSON)
        new_values: New state (JSON)
        ip_address: IP address of the user
        user_agent: Browser/client user agent
        request_id: Unique request identifier for correlation
    """
    
    __tablename__ = "audit_logs"
    
    # Who
    user_id = Column(
        Integer,
        ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True,
        index=True
    )
    
    # What
    action = Column(SQLEnum(AuditAction), nullable=False, index=True)
    entity_type = Column(SQLEnum(AuditEntity), nullable=False, index=True)
    entity_id = Column(Integer, nullable=True, index=True)
    description = Column(Text, nullable=False)
    
    # Changes
    old_values = Column(Text, nullable=True)  # JSON stored as text
    new_values = Column(Text, nullable=True)  # JSON stored as text
    
    # Context
    ip_address = Column(String(45), nullable=True)  # IPv6 max length
    user_agent = Column(String(500), nullable=True)
    request_id = Column(String(100), nullable=True, index=True)
    
    # Relationships
    user = relationship("User")
    
    def __repr__(self) -> str:
        """String representation."""
        user_email = self.user.email if self.user else "SYSTEM"
        return (
            f"<AuditLog(user={user_email}, action={self.action}, "
            f"entity={self.entity_type}, id={self.entity_id})>"
        )
    
    def get_old_values(self):
        """Get old values as dictionary."""
        if not self.old_values:
            return {}
        try:
            return json.loads(self.old_values)
        except json.JSONDecodeError:
            return {}
    
    def set_old_values(self, values_dict):
        """Set old values from dictionary."""
        if not values_dict:
            self.old_values = None
        else:
            self.old_values = json.dumps(values_dict)
    
    def get_new_values(self):
        """Get new values as dictionary."""
        if not self.new_values:
            return {}
        try:
            return json.loads(self.new_values)
        except json.JSONDecodeError:
            return {}
    
    def set_new_values(self, values_dict):
        """Set new values from dictionary."""
        if not values_dict:
            self.new_values = None
        else:
            self.new_values = json.dumps(values_dict)
    
    @classmethod
    def log_action(
        cls,
        db,
        action: AuditAction,
        entity_type: AuditEntity,
        description: str,
        user_id: int = None,
        entity_id: int = None,
        old_values: dict = None,
        new_values: dict = None,
        ip_address: str = None,
        user_agent: str = None,
        request_id: str = None
    ):
        """
        Helper method to create audit log entry.
        
        Args:
            db: Database session
            action: Type of action
            entity_type: Type of entity
            description: Description of the action
            user_id: Optional user ID
            entity_id: Optional entity ID
            old_values: Optional previous state
            new_values: Optional new state
            ip_address: Optional IP address
            user_agent: Optional user agent
            request_id: Optional request ID
            
        Returns:
            Created AuditLog instance
        """
        audit_log = cls(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent,
            request_id=request_id
        )
        
        # Set JSON values using helper methods
        if old_values:
            audit_log.set_old_values(old_values)
        if new_values:
            audit_log.set_new_values(new_values)
            
        db.add(audit_log)
        db.commit()
        return audit_log
