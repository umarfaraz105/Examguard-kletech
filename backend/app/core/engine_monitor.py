"""Engine execution monitoring and tracking."""
from typing import Dict, Any, Optional
from functools import wraps
import time
import uuid
from datetime import datetime
import logging
from sqlalchemy.orm import Session

from app.models.engine_execution import EngineExecution, ExecutionStatus
from app.core.engine_interface import BaseEngine, EngineExecutionResult

logger = logging.getLogger(__name__)


class EngineMonitor:
    """Monitor and track engine executions."""
    
    @staticmethod
    def track_execution(db: Session, user_id: int, plan_id: Optional[int] = None):
        """
        Decorator to track engine execution.
        
        Args:
            db: Database session
            user_id: ID of user executing the engine
            plan_id: Optional plan ID associated with execution
        """
        def decorator(func):
            @wraps(func)
            def wrapper(engine: BaseEngine, input_data: Dict[str, Any], *args, **kwargs):
                # Generate execution ID
                execution_id = str(uuid.uuid4())
                metadata = engine.get_metadata()
                
                # Create execution record
                execution_record = EngineExecution(
                    execution_id=execution_id,
                    engine_name=metadata.name,
                    engine_version=metadata.version,
                    status=ExecutionStatus.RUNNING,
                    input_data=input_data,
                    user_id=user_id,
                    plan_id=plan_id,
                    started_at=datetime.utcnow()
                )
                
                db.add(execution_record)
                db.commit()
                
                start_time = time.time()
                
                try:
                    # Execute the engine
                    logger.info(f"Starting execution {execution_id} for engine {metadata.name}")
                    
                    result = func(engine, input_data, *args, **kwargs)
                    
                    # Calculate execution time
                    execution_time = int((time.time() - start_time) * 1000)
                    
                    # Update execution record with success
                    execution_record.status = ExecutionStatus.COMPLETED
                    execution_record.completed_at = datetime.utcnow()
                    execution_record.execution_time_ms = execution_time
                    execution_record.output_data = result.result_data if hasattr(result, 'result_data') else result
                    execution_record.warnings = getattr(result, 'warnings', [])
                    
                    db.commit()
                    
                    logger.info(
                        f"Completed execution {execution_id} for engine {metadata.name} "
                        f"in {execution_time}ms"
                    )
                    
                    return result
                    
                except Exception as e:
                    # Calculate execution time
                    execution_time = int((time.time() - start_time) * 1000)
                    
                    # Update execution record with failure
                    execution_record.status = ExecutionStatus.FAILED
                    execution_record.completed_at = datetime.utcnow()
                    execution_record.execution_time_ms = execution_time
                    execution_record.error_message = str(e)
                    
                    db.commit()
                    
                    logger.error(
                        f"Failed execution {execution_id} for engine {metadata.name}: {str(e)}"
                    )
                    
                    raise
            
            return wrapper
        return decorator
    
    @staticmethod
    def get_execution_stats(db: Session, engine_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Get execution statistics.
        
        Args:
            db: Database session
            engine_name: Optional engine name to filter by
            
        Returns:
            Dictionary with execution statistics
        """
        query = db.query(EngineExecution)
        
        if engine_name:
            query = query.filter(EngineExecution.engine_name == engine_name)
        
        executions = query.all()
        
        if not executions:
            return {
                "total_executions": 0,
                "successful": 0,
                "failed": 0,
                "average_execution_time": 0,
                "success_rate": 0
            }
        
        successful = sum(1 for e in executions if e.status == ExecutionStatus.COMPLETED)
        failed = sum(1 for e in executions if e.status == ExecutionStatus.FAILED)
        
        # Calculate average execution time for completed executions
        completed_with_time = [
            e.execution_time_ms for e in executions 
            if e.status == ExecutionStatus.COMPLETED and e.execution_time_ms
        ]
        
        avg_time = sum(completed_with_time) / len(completed_with_time) if completed_with_time else 0
        
        return {
            "total_executions": len(executions),
            "successful": successful,
            "failed": failed,
            "running": sum(1 for e in executions if e.status == ExecutionStatus.RUNNING),
            "average_execution_time": int(avg_time),
            "success_rate": (successful / len(executions)) * 100 if executions else 0
        }
    
    @staticmethod
    def get_recent_executions(
        db: Session, 
        engine_name: Optional[str] = None, 
        limit: int = 10
    ) -> list:
        """
        Get recent executions.
        
        Args:
            db: Database session
            engine_name: Optional engine name to filter by
            limit: Number of executions to return
            
        Returns:
            List of recent execution records
        """
        query = db.query(EngineExecution)
        
        if engine_name:
            query = query.filter(EngineExecution.engine_name == engine_name)
        
        executions = query.order_by(
            EngineExecution.started_at.desc()
        ).limit(limit).all()
        
        return [execution.to_dict() for execution in executions]
    
    @staticmethod
    def cleanup_old_executions(db: Session, days_to_keep: int = 30) -> int:
        """
        Clean up old execution records.
        
        Args:
            db: Database session
            days_to_keep: Number of days to keep records
            
        Returns:
            Number of records deleted
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days_to_keep)
        
        deleted = db.query(EngineExecution).filter(
            EngineExecution.started_at < cutoff_date,
            EngineExecution.status.in_([ExecutionStatus.COMPLETED, ExecutionStatus.FAILED])
        ).delete()
        
        db.commit()
        
        logger.info(f"Cleaned up {deleted} old execution records")
        return deleted