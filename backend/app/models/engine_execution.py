"""Engine execution tracking model."""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import json
from app.models.base import Base


class ExecutionStatus(str, enum.Enum):
    """Execution status enum"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class EngineExecution(Base):
    """Track engine executions for monitoring and auditing."""
    
    __tablename__ = "engine_executions"
    
    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(String(50), unique=True, nullable=False, index=True)
    
    # Engine information
    engine_name = Column(String(100), nullable=False, index=True)
    engine_version = Column(String(20))
    
    # Execution details
    status = Column(SQLEnum(ExecutionStatus), default=ExecutionStatus.PENDING, index=True)
    input_data = Column(Text)  # JSON stored as text
    output_data = Column(Text)  # JSON stored as text
    error_message = Column(Text)
    warnings = Column(Text)  # JSON list of warning messages stored as text
    
    # Timing
    started_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime)
    execution_time_ms = Column(Integer)  # Execution time in milliseconds
    
    # User tracking
    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship("User")
    
    # Plan association (if applicable)
    plan_id = Column(Integer, ForeignKey('plans.id'), nullable=True)
    plan = relationship("Plan")
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<EngineExecution {self.execution_id} - {self.engine_name} ({self.status.value})>"
    
    def to_dict(self):
        """Convert to dictionary."""
        return {
            "id": self.id,
            "execution_id": self.execution_id,
            "engine_name": self.engine_name,
            "engine_version": self.engine_version,
            "status": self.status.value,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "execution_time_ms": self.execution_time_ms,
            "error_message": self.error_message,
            "warnings": self.get_warnings(),
            "user_id": self.user_id,
            "plan_id": self.plan_id
        }
    
    def get_input_data(self):
        """Get input data as Python object."""
        if not self.input_data:
            return None
        try:
            return json.loads(self.input_data)
        except json.JSONDecodeError:
            return None
    
    def set_input_data(self, data):
        """Set input data from Python object."""
        if data is None:
            self.input_data = None
        else:
            self.input_data = json.dumps(data)
    
    def get_output_data(self):
        """Get output data as Python object."""
        if not self.output_data:
            return None
        try:
            return json.loads(self.output_data)
        except json.JSONDecodeError:
            return None
    
    def set_output_data(self, data):
        """Set output data from Python object."""
        if data is None:
            self.output_data = None
        else:
            self.output_data = json.dumps(data)
    
    def get_warnings(self):
        """Get warnings as list."""
        if not self.warnings:
            return []
        try:
            return json.loads(self.warnings)
        except json.JSONDecodeError:
            return []
    
    def set_warnings(self, warnings_list):
        """Set warnings from list."""
        if not warnings_list:
            self.warnings = None
        else:
            self.warnings = json.dumps(warnings_list)


class EngineConfiguration(Base):
    """Store engine-specific configuration."""
    
    __tablename__ = "engine_configurations"
    
    id = Column(Integer, primary_key=True, index=True)
    engine_name = Column(String(100), unique=True, nullable=False, index=True)
    
    # Configuration
    version = Column(String(20))
    enabled = Column(Integer, default=1)  # SQLite doesn't have Boolean, use Integer
    config_json = Column(Text)  # Engine-specific configuration stored as JSON text
    feature_flags = Column(Text)  # Feature flags stored as JSON text
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<EngineConfiguration {self.engine_name} - Enabled: {bool(self.enabled)}>"
    
    @property
    def is_enabled(self):
        """Check if engine is enabled."""
        return bool(self.enabled)
    
    def get_config(self, key: str, default=None):
        """Get configuration value."""
        config = self.get_config_dict()
        if not config:
            return default
        return config.get(key, default)
    
    def get_config_dict(self):
        """Get configuration as dictionary."""
        if not self.config_json:
            return {}
        try:
            return json.loads(self.config_json)
        except json.JSONDecodeError:
            return {}
    
    def set_config(self, config_dict):
        """Set configuration from dictionary."""
        if not config_dict:
            self.config_json = None
        else:
            self.config_json = json.dumps(config_dict)
    
    def is_feature_enabled(self, feature: str) -> bool:
        """Check if a feature flag is enabled."""
        flags = self.get_feature_flags()
        return flags.get(feature, False)
    
    def get_feature_flags(self):
        """Get feature flags as dictionary."""
        if not self.feature_flags:
            return {}
        try:
            return json.loads(self.feature_flags)
        except json.JSONDecodeError:
            return {}
    
    def set_feature_flags(self, flags_dict):
        """Set feature flags from dictionary."""
        if not flags_dict:
            self.feature_flags = None
        else:
            self.feature_flags = json.dumps(flags_dict)
