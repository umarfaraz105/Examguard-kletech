"""Base engine interface that all engines must implement."""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from enum import Enum
from datetime import datetime
from pydantic import BaseModel


class EngineStatus(Enum):
    """Engine execution status"""
    IDLE = "idle"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class EngineMetadata(BaseModel):
    """Engine metadata and capabilities"""
    name: str  # Unique identifier (e.g., "engine1-scheduling")
    display_name: str  # Human-readable name
    version: str  # Semantic version
    description: str
    capabilities: List[str] = []  # What this engine can do
    dependencies: List[str] = []  # Other engines it depends on
    execution_order: int = 0  # Order in workflow (0 = can run independently)
    requires_approval: bool = False  # Needs manual approval before execution


class EngineValidationError(BaseModel):
    """Validation error details"""
    field: str
    message: str
    severity: str = "error"  # error, warning, info


class EngineExecutionResult(BaseModel):
    """Standardized execution result"""
    success: bool
    status: EngineStatus
    execution_id: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    execution_time_ms: Optional[int] = None
    result_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    warnings: List[str] = []


class BaseEngine(ABC):
    """
    Base contract that all engines must implement.
    
    This ensures consistency across all engines and enables
    the plugin architecture for future engine additions.
    """
    
    @abstractmethod
    def get_metadata(self) -> EngineMetadata:
        """
        Return engine metadata and capabilities.
        
        This is called during engine discovery and registration.
        """
        pass
    
    @abstractmethod
    def validate_input(self, input_data: Dict[str, Any]) -> List[EngineValidationError]:
        """
        Validate input data before execution.
        
        Args:
            input_data: Input parameters for execution
            
        Returns:
            List of validation errors (empty if valid)
        """
        pass
    
    @abstractmethod
    def execute(self, input_data: Dict[str, Any], db: Any) -> EngineExecutionResult:
        """
        Execute the engine logic.
        
        Args:
            input_data: Validated input parameters
            db: Database session
            
        Returns:
            Standardized execution result
        """
        pass
    
    @abstractmethod
    def get_status(self, execution_id: str) -> EngineStatus:
        """
        Get current execution status.
        
        Args:
            execution_id: Unique execution identifier
            
        Returns:
            Current status
        """
        pass
    
    @abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """
        Check engine health and dependencies.
        
        Returns:
            {
                "status": "healthy" | "degraded" | "unhealthy",
                "checks": {
                    "database": "ok" | "error",
                    "dependencies": "ok" | "error",
                    ...
                },
                "message": "Optional message"
            }
        """
        pass
    
    def rollback(self, execution_id: str, db: Any) -> bool:
        """
        Rollback changes from a failed execution (optional).
        
        Args:
            execution_id: Execution to rollback
            db: Database session
            
        Returns:
            True if rollback successful
        """
        return False
    
    def get_input_schema(self) -> Dict[str, Any]:
        """
        Return JSON schema for input validation (optional).
        
        Returns:
            JSON Schema dictionary
        """
        return {}
    
    def get_output_schema(self) -> Dict[str, Any]:
        """
        Return JSON schema for output format (optional).
        
        Returns:
            JSON Schema dictionary
        """
        return {}
