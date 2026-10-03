-- Migration to add engine tracking tables
-- Run this SQL or create an Alembic migration

-- Engine Executions Table
CREATE TABLE IF NOT EXISTS engine_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    execution_id VARCHAR(50) UNIQUE NOT NULL,
    engine_name VARCHAR(100) NOT NULL,
    engine_version VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending',
    input_data TEXT,  -- JSON
    output_data TEXT,  -- JSON
    error_message TEXT,
    warnings TEXT,  -- JSON
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    execution_time_ms INTEGER,
    user_id INTEGER,
    plan_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (plan_id) REFERENCES plans(id)
);

CREATE INDEX idx_engine_executions_engine_name ON engine_executions(engine_name);
CREATE INDEX idx_engine_executions_status ON engine_executions(status);
CREATE INDEX idx_engine_executions_started_at ON engine_executions(started_at);
CREATE INDEX idx_engine_executions_execution_id ON engine_executions(execution_id);

-- Engine Configurations Table
CREATE TABLE IF NOT EXISTS engine_configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    engine_name VARCHAR(100) UNIQUE NOT NULL,
    version VARCHAR(20),
    enabled INTEGER DEFAULT 1,  -- 1 = enabled, 0 = disabled
    config_json TEXT,  -- JSON
    feature_flags TEXT,  -- JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_engine_configurations_engine_name ON engine_configurations(engine_name);

-- Insert default configurations for existing engines
INSERT OR IGNORE INTO engine_configurations (engine_name, version, enabled, config_json, feature_flags)
VALUES 
    ('engine1-scheduling', '1.0.0', 1, '{"timeout": 60, "max_retries": 3}', '{}'),
    ('engine2-room-seating', '1.0.0', 1, '{"timeout": 60}', '{}'),
    ('engine3-invigilator', '1.0.0', 1, '{"timeout": 60}', '{}'),
    ('engine4-validation', '1.0.0', 1, '{"timeout": 60}', '{}');
