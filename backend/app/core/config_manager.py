"""Unified configuration management for engines."""
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
import json
import logging

from app.models.engine_execution import EngineConfiguration

logger = logging.getLogger(__name__)


class ConfigManager:
    """Manage engine configurations and feature flags."""
    
    @staticmethod
    def get_engine_config(db: Session, engine_name: str) -> Optional[EngineConfiguration]:
        """
        Get configuration for an engine.
        
        Args:
            db: Database session
            engine_name: Name of the engine
            
        Returns:
            EngineConfiguration or None if not found
        """
        return db.query(EngineConfiguration).filter(
            EngineConfiguration.engine_name == engine_name
        ).first()
    
    @staticmethod
    def create_default_config(
        db: Session, 
        engine_name: str, 
        version: str = "1.0.0",
        config: Optional[Dict[str, Any]] = None,
        feature_flags: Optional[Dict[str, bool]] = None
    ) -> EngineConfiguration:
        """
        Create default configuration for an engine.
        
        Args:
            db: Database session
            engine_name: Name of the engine
            version: Engine version
            config: Default configuration dictionary
            feature_flags: Default feature flags
            
        Returns:
            Created EngineConfiguration
        """
        # Check if config already exists
        existing = ConfigManager.get_engine_config(db, engine_name)
        if existing:
            logger.warning(f"Configuration for {engine_name} already exists")
            return existing
        
        default_config = config or {
            "timeout": 60,
            "max_retries": 3,
            "enable_monitoring": True
        }
        
        default_flags = feature_flags or {}
        
        engine_config = EngineConfiguration(
            engine_name=engine_name,
            version=version,
            enabled=1,  # Enabled by default
            config_json=default_config,
            feature_flags=default_flags
        )
        
        db.add(engine_config)
        db.commit()
        db.refresh(engine_config)
        
        logger.info(f"Created default configuration for {engine_name}")
        return engine_config
    
    @staticmethod
    def update_config(
        db: Session,
        engine_name: str,
        config_updates: Optional[Dict[str, Any]] = None,
        feature_flag_updates: Optional[Dict[str, bool]] = None,
        enabled: Optional[bool] = None
    ) -> bool:
        """
        Update engine configuration.
        
        Args:
            db: Database session
            engine_name: Name of the engine
            config_updates: Configuration updates
            feature_flag_updates: Feature flag updates
            enabled: Whether engine is enabled
            
        Returns:
            True if updated successfully
        """
        config = ConfigManager.get_engine_config(db, engine_name)
        
        if not config:
            logger.error(f"Configuration for {engine_name} not found")
            return False
        
        # Update configuration
        if config_updates:
            current_config = config.config_json or {}
            current_config.update(config_updates)
            config.config_json = current_config
        
        # Update feature flags
        if feature_flag_updates:
            current_flags = config.feature_flags or {}
            current_flags.update(feature_flag_updates)
            config.feature_flags = current_flags
        
        # Update enabled status
        if enabled is not None:
            config.enabled = 1 if enabled else 0
        
        db.commit()
        
        logger.info(f"Updated configuration for {engine_name}")
        return True
    
    @staticmethod
    def get_config_value(
        db: Session,
        engine_name: str,
        key: str,
        default: Any = None
    ) -> Any:
        """
        Get a specific configuration value.
        
        Args:
            db: Database session
            engine_name: Name of the engine
            key: Configuration key
            default: Default value if not found
            
        Returns:
            Configuration value or default
        """
        config = ConfigManager.get_engine_config(db, engine_name)
        
        if not config or not config.config_json:
            return default
        
        return config.config_json.get(key, default)
    
    @staticmethod
    def is_feature_enabled(
        db: Session,
        engine_name: str,
        feature: str
    ) -> bool:
        """
        Check if a feature flag is enabled.
        
        Args:
            db: Database session
            engine_name: Name of the engine
            feature: Feature name
            
        Returns:
            True if feature is enabled
        """
        config = ConfigManager.get_engine_config(db, engine_name)
        
        if not config or not config.feature_flags:
            return False
        
        return config.feature_flags.get(feature, False)
    
    @staticmethod
    def is_engine_enabled(db: Session, engine_name: str) -> bool:
        """
        Check if an engine is enabled.
        
        Args:
            db: Database session
            engine_name: Name of the engine
            
        Returns:
            True if engine is enabled
        """
        config = ConfigManager.get_engine_config(db, engine_name)
        
        if not config:
            return True  # Default to enabled if no config found
        
        return config.is_enabled
    
    @staticmethod
    def list_all_configs(db: Session) -> List[Dict[str, Any]]:
        """
        List all engine configurations.
        
        Args:
            db: Database session
            
        Returns:
            List of all configuration dictionaries
        """
        configs = db.query(EngineConfiguration).all()
        
        return [
            {
                "engine_name": config.engine_name,
                "version": config.version,
                "enabled": config.is_enabled,
                "config": config.config_json,
                "feature_flags": config.feature_flags,
                "created_at": config.created_at.isoformat(),
                "updated_at": config.updated_at.isoformat()
            }
            for config in configs
        ]
    
    @staticmethod
    def export_config(db: Session, engine_name: str) -> Optional[str]:
        """
        Export engine configuration as JSON string.
        
        Args:
            db: Database session
            engine_name: Name of the engine
            
        Returns:
            JSON string or None if not found
        """
        config = ConfigManager.get_engine_config(db, engine_name)
        
        if not config:
            return None
        
        export_data = {
            "engine_name": config.engine_name,
            "version": config.version,
            "enabled": config.is_enabled,
            "config": config.config_json,
            "feature_flags": config.feature_flags
        }
        
        return json.dumps(export_data, indent=2)
    
    @staticmethod
    def import_config(db: Session, config_json: str) -> bool:
        """
        Import engine configuration from JSON string.
        
        Args:
            db: Database session
            config_json: JSON string with configuration
            
        Returns:
            True if imported successfully
        """
        try:
            data = json.loads(config_json)
            
            engine_name = data.get("engine_name")
            if not engine_name:
                logger.error("Missing engine_name in import data")
                return False
            
            # Check if config exists
            existing = ConfigManager.get_engine_config(db, engine_name)
            
            if existing:
                # Update existing
                existing.version = data.get("version", existing.version)
                existing.enabled = 1 if data.get("enabled", True) else 0
                existing.config_json = data.get("config", existing.config_json)
                existing.feature_flags = data.get("feature_flags", existing.feature_flags)
            else:
                # Create new
                new_config = EngineConfiguration(
                    engine_name=engine_name,
                    version=data.get("version", "1.0.0"),
                    enabled=1 if data.get("enabled", True) else 0,
                    config_json=data.get("config", {}),
                    feature_flags=data.get("feature_flags", {})
                )
                db.add(new_config)
            
            db.commit()
            
            logger.info(f"Successfully imported configuration for {engine_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to import configuration: {e}")
            return False