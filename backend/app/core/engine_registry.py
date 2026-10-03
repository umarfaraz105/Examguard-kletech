"""Engine registry for dynamic engine discovery and management."""
from typing import Dict, List, Optional, Any
from app.core.engine_interface import BaseEngine, EngineMetadata, EngineStatus
import logging

logger = logging.getLogger(__name__)


class EngineRegistry:
    """
    Central registry for all engines.
    
    Engines self-register on import, enabling dynamic discovery
    and eliminating the need for manual registration in multiple files.
    """
    
    _engines: Dict[str, BaseEngine] = {}
    _initialized: bool = False
    
    @classmethod
    def register(cls, engine: BaseEngine) -> None:
        """
        Register an engine with the system.
        
        Args:
            engine: Engine instance to register
            
        Raises:
            ValueError: If engine name already registered
        """
        metadata = engine.get_metadata()
        
        if metadata.name in cls._engines:
            logger.warning(f"Engine '{metadata.name}' already registered. Skipping.")
            return
        
        cls._engines[metadata.name] = engine
        logger.info(
            f"Registered engine: {metadata.name} v{metadata.version} "
            f"({metadata.display_name})"
        )
    
    @classmethod
    def unregister(cls, engine_name: str) -> bool:
        """
        Unregister an engine.
        
        Args:
            engine_name: Name of engine to unregister
            
        Returns:
            True if unregistered, False if not found
        """
        if engine_name in cls._engines:
            del cls._engines[engine_name]
            logger.info(f"Unregistered engine: {engine_name}")
            return True
        return False
    
    @classmethod
    def get_engine(cls, name: str) -> Optional[BaseEngine]:
        """
        Get engine by name.
        
        Args:
            name: Engine name
            
        Returns:
            Engine instance or None if not found
        """
        return cls._engines.get(name)
    
    @classmethod
    def list_engines(cls, include_metadata: bool = True) -> List[Dict[str, Any]]:
        """
        List all registered engines.
        
        Args:
            include_metadata: Include full metadata
            
        Returns:
            List of engine information
        """
        engines = []
        for name, engine in cls._engines.items():
            metadata = engine.get_metadata()
            
            engine_info = {
                "name": metadata.name,
                "display_name": metadata.display_name,
                "version": metadata.version,
                "status": "registered"
            }
            
            if include_metadata:
                engine_info.update({
                    "description": metadata.description,
                    "capabilities": metadata.capabilities,
                    "dependencies": metadata.dependencies,
                    "execution_order": metadata.execution_order,
                    "requires_approval": metadata.requires_approval
                })
            
            # Add health status
            try:
                health = engine.health_check()
                engine_info["health"] = health.get("status", "unknown")
            except Exception as e:
                engine_info["health"] = "error"
                logger.error(f"Health check failed for {name}: {e}")
            
            engines.append(engine_info)
        
        # Sort by execution order
        engines.sort(key=lambda x: x.get("execution_order", 999))
        
        return engines
    
    @classmethod
    def get_by_capabilities(cls, capability: str) -> List[BaseEngine]:
        """
        Find engines by capability.
        
        Args:
            capability: Capability to search for
            
        Returns:
            List of engines with that capability
        """
        matching = []
        for engine in cls._engines.values():
            metadata = engine.get_metadata()
            if capability in metadata.capabilities:
                matching.append(engine)
        return matching
    
    @classmethod
    def validate_dependencies(cls) -> Dict[str, List[str]]:
        """
        Validate that all engine dependencies are satisfied.
        
        Returns:
            Dictionary of engines with missing dependencies
        """
        issues = {}
        
        for name, engine in cls._engines.items():
            metadata = engine.get_metadata()
            missing = []
            
            for dep in metadata.dependencies:
                if dep not in cls._engines:
                    missing.append(dep)
            
            if missing:
                issues[name] = missing
        
        return issues
    
    @classmethod
    def get_execution_order(cls) -> List[str]:
        """
        Get engines sorted by execution order.
        
        Returns:
            List of engine names in execution order
        """
        engines = [
            (engine.get_metadata().execution_order, name)
            for name, engine in cls._engines.items()
        ]
        engines.sort()
        return [name for _, name in engines]
    
    @classmethod
    def health_check_all(cls) -> Dict[str, Dict[str, Any]]:
        """
        Run health checks on all engines.
        
        Returns:
            Dictionary of engine health statuses
        """
        results = {}
        for name, engine in cls._engines.items():
            try:
                results[name] = engine.health_check()
            except Exception as e:
                results[name] = {
                    "status": "unhealthy",
                    "error": str(e)
                }
        return results
    
    @classmethod
    def clear(cls) -> None:
        """Clear all registered engines (for testing)."""
        cls._engines.clear()
        cls._initialized = False
    
    @classmethod
    def is_initialized(cls) -> bool:
        """Check if registry has been initialized."""
        return cls._initialized
    
    @classmethod
    def set_initialized(cls) -> None:
        """Mark registry as initialized."""
        cls._initialized = True
        logger.info(f"Engine registry initialized with {len(cls._engines)} engines")


# Create global instance
engine_registry = EngineRegistry()
