"""
Unified engine API - Dynamic and extensible.

This router automatically handles all registered engines through
the EngineRegistry, eliminating the need to modify this file
when adding new engines.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
import uuid
from datetime import datetime
import time

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.engine_registry import engine_registry
from app.models.user import User
from app.models.engine_execution import EngineExecution, ExecutionStatus, EngineConfiguration
from pydantic import BaseModel

router = APIRouter()


# Request/Response Models
class EngineExecuteRequest(BaseModel):
    """Generic engine execution request"""
    input_data: Dict[str, Any]


class EngineExecuteResponse(BaseModel):
    """Engine execution response"""
    execution_id: str
    engine_name: str
    status: str
    message: str


class EngineStatusResponse(BaseModel):
    """Engine status response"""
    execution_id: str
    engine_name: str
    status: str
    started_at: str
    completed_at: str | None
    execution_time_ms: int | None
    result_data: Dict[str, Any] | None
    error_message: str | None
    warnings: List[str]


# Engine Discovery Endpoints
@router.get("/")
def list_engines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    List all registered engines with metadata.
    
    This endpoint allows the frontend to dynamically discover
    available engines without hard-coding them.
    """
    engines = engine_registry.list_engines(include_metadata=True)
    
    # Check database configuration for each engine
    for engine in engines:
        config = db.query(EngineConfiguration).filter(
            EngineConfiguration.engine_name == engine['name']
        ).first()
        
        if config:
            engine['configured'] = True
            engine['enabled'] = config.is_enabled
            engine['config'] = config.config_json
        else:
            engine['configured'] = False
            engine['enabled'] = True  # Default to enabled
    
    return {
        "engines": engines,
        "count": len(engines)
    }


@router.get("/{engine_name}/metadata")
def get_engine_metadata(
    engine_name: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed metadata for a specific engine."""
    engine = engine_registry.get_engine(engine_name)
    
    if not engine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Engine '{engine_name}' not found"
        )
    
    metadata = engine.get_metadata()
    health = engine.health_check()
    
    return {
        "name": metadata.name,
        "display_name": metadata.display_name,
        "version": metadata.version,
        "description": metadata.description,
        "capabilities": metadata.capabilities,
        "dependencies": metadata.dependencies,
        "execution_order": metadata.execution_order,
        "requires_approval": metadata.requires_approval,
        "health": health,
        "input_schema": engine.get_input_schema(),
        "output_schema": engine.get_output_schema()
    }


@router.get("/{engine_name}/health")
def check_engine_health(
    engine_name: str,
    current_user: User = Depends(get_current_user)
):
    """Check health status of a specific engine."""
    engine = engine_registry.get_engine(engine_name)
    
    if not engine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Engine '{engine_name}' not found"
        )
    
    return engine.health_check()


# Engine Execution Endpoints
@router.post("/{engine_name}/execute", response_model=EngineExecuteResponse)
def execute_engine(
    engine_name: str,
    request: EngineExecuteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Execute any registered engine.
    
    This is the universal engine execution endpoint. Add a new engine
    and it automatically becomes available through this endpoint.
    """
    # Get engine
    engine = engine_registry.get_engine(engine_name)
    
    if not engine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Engine '{engine_name}' not found"
        )
    
    # Check if engine is enabled
    config = db.query(EngineConfiguration).filter(
        EngineConfiguration.engine_name == engine_name
    ).first()
    
    if config and not config.is_enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Engine '{engine_name}' is currently disabled"
        )
    
    # Validate input
    validation_errors = engine.validate_input(request.input_data)
    if validation_errors:
        error_messages = [
            f"{err.field}: {err.message}" for err in validation_errors
        ]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Input validation failed",
                "errors": error_messages
            }
        )
    
    # Create execution record
    execution_id = str(uuid.uuid4())
    metadata = engine.get_metadata()
    
    execution_record = EngineExecution(
        execution_id=execution_id,
        engine_name=metadata.name,
        engine_version=metadata.version,
        status=ExecutionStatus.RUNNING,
        user_id=current_user.id,
        plan_id=request.input_data.get('plan_id')  # If applicable
    )
    # Set JSON data using helper methods
    execution_record.set_input_data(request.input_data)
    db.add(execution_record)
    db.commit()
    
    # Execute engine
    try:
        start_time = time.time()
        result = engine.execute(request.input_data, db)
        execution_time = int((time.time() - start_time) * 1000)
        
        # Update execution record
        execution_record.status = ExecutionStatus.COMPLETED if result.success else ExecutionStatus.FAILED
        execution_record.completed_at = datetime.utcnow()
        execution_record.execution_time_ms = execution_time
        execution_record.set_output_data(result.result_data)
        execution_record.error_message = result.error_message
        execution_record.set_warnings(result.warnings)
        
        db.commit()
        
        return EngineExecuteResponse(
            execution_id=execution_id,
            engine_name=metadata.name,
            status="success" if result.success else "failed",
            message=result.error_message or f"Engine executed successfully in {execution_time}ms"
        )
        
    except Exception as e:
        # Update execution record with error
        execution_record.status = ExecutionStatus.FAILED
        execution_record.completed_at = datetime.utcnow()
        execution_record.error_message = str(e)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Engine execution failed: {str(e)}"
        )


@router.get("/{engine_name}/status/{execution_id}", response_model=EngineStatusResponse)
def get_execution_status(
    engine_name: str,
    execution_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get status of a specific engine execution."""
    execution = db.query(EngineExecution).filter(
        EngineExecution.execution_id == execution_id,
        EngineExecution.engine_name == engine_name
    ).first()
    
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Execution '{execution_id}' not found"
        )
    
    return EngineStatusResponse(
        execution_id=execution.execution_id,
        engine_name=execution.engine_name,
        status=execution.status.value,
        started_at=execution.started_at.isoformat(),
        completed_at=execution.completed_at.isoformat() if execution.completed_at else None,
        execution_time_ms=execution.execution_time_ms,
        result_data=execution.get_output_data(),
        error_message=execution.error_message,
        warnings=execution.get_warnings()
    )


@router.get("/{engine_name}/executions")
def list_engine_executions(
    engine_name: str,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List recent executions for an engine."""
    executions = db.query(EngineExecution).filter(
        EngineExecution.engine_name == engine_name
    ).order_by(
        EngineExecution.started_at.desc()
    ).limit(limit).all()
    
    return {
        "executions": [exec.to_dict() for exec in executions],
        "count": len(executions)
    }


# Health Check for All Engines
@router.get("/health/all")
def health_check_all_engines(
    current_user: User = Depends(get_current_user)
):
    """Check health of all registered engines."""
    return engine_registry.health_check_all()


# Dependency Validation
@router.get("/dependencies/validate")
def validate_dependencies(
    current_user: User = Depends(get_current_user)
):
    """Validate that all engine dependencies are satisfied."""
    issues = engine_registry.validate_dependencies()
    
    return {
        "valid": len(issues) == 0,
        "issues": issues
    }
