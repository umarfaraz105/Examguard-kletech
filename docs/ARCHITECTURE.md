# ExamGuard System Architecture v2.0

## Overview

ExamGuard is a **modular, extensible examination management system** built with a **plugin-based engine architecture**. The system is designed to scale horizontally by adding new engines without modifying existing code.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    EXAMGUARD PLATFORM                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              CORE PLATFORM LAYER                   │    │
│  │  • Authentication/Authorization (JWT, RBAC)        │    │
│  │  • Engine Registry (Dynamic Discovery)             │    │
│  │  • Configuration Management (Feature Flags)        │    │
│  │  • Monitoring & Observability                      │    │
│  │  • Repository Pattern (Data Abstraction)           │    │
│  │  • API Gateway (Rate Limiting, Versioning)         │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │           ENGINE MANAGEMENT LAYER                  │    │
│  │                                                     │    │
│  │    ┌─────────────────────────────────┐            │    │
│  │    │    ENGINE REGISTRY              │            │    │
│  │    │  • Discovery & Registration     │            │    │
│  │    │  • Health Monitoring            │            │    │
│  │    │  • Lifecycle Management         │            │    │
│  │    │  • Dependency Validation        │            │    │
│  │    │  • Execution Tracking           │            │    │
│  │    └─────────────────────────────────┘            │    │
│  │                                                     │    │
│  │    ┌─────────────────────────────────┐            │    │
│  │    │    BASE ENGINE CONTRACT         │            │    │
│  │    │  • Metadata Standards           │            │    │
│  │    │  • Execution Protocol           │            │    │
│  │    │  • Validation Interface         │            │    │
│  │    │  • Health Check Protocol        │            │    │
│  │    │  • Configuration Support        │            │    │
│  │    └─────────────────────────────────┘            │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │              ENGINE INSTANCES                      │    │
│  │                                                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │  │ Engine 1 │  │ Engine 2 │  │ Engine 3 │        │    │
│  │  │Scheduling│  │Room/Seat │  │Invigilat │        │    │
│  │  │(OR-Tools)│  │Allocate  │  │Management│        │    │
│  │  └──────────┘  └──────────┘  └──────────┘        │    │
│  │                                                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │  │ Engine 4 │  │ Engine 5 │  │ Engine N │        │    │
│  │  │Validation│  │  Future  │  │  Future  │        │    │
│  │  │& Reports │  │  Plugin  │  │  Plugin  │        │    │
│  │  └──────────┘  └──────────┘  └──────────┘        │    │
│  │                                                     │    │
│  │  Each engine:                                      │    │
│  │  • Implements BaseEngine interface                │    │
│  │  • Self-registers on import                       │    │
│  │  • Provides health endpoints                      │    │
│  │  • Uses repository pattern                        │    │
│  │  • Independent configuration                      │    │
│  │  • Execution monitoring                           │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │         DATA ACCESS LAYER (Repositories)           │    │
│  │  • PlanRepository                                  │    │
│  │  • CourseRepository                                │    │
│  │  • StudentRepository                               │    │
│  │  • RoomRepository                                  │    │
│  │  • EngineConfigurationRepository                   │    │
│  │  • EngineExecutionRepository                       │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │              DATABASE (SQLite/PostgreSQL)          │    │
│  │  • Core Tables (users, courses, students, etc.)   │    │
│  │  • Engine Configuration Tables                     │    │
│  │  • Engine Execution Log Tables                     │    │
│  │  • Audit Tables                                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘

           ↕ REST API v1 & v2

┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│                                                              │
│  • Dynamic Engine Discovery                                 │
│  • Generic Engine Execution Components                      │
│  • Real-time Status Monitoring                              │
│  • Engine-agnostic UI                                       │
│  • Configuration Management UI                              │
│  • Execution Monitoring Dashboard                           │
└─────────────────────────────────────────────────────────────┘
```

## Key Architectural Principles

### 1. **Plugin-Based Engine Architecture**
- All engines implement a common `BaseEngine` interface
- Engines self-register on system startup
- New engines can be added without modifying existing code
- Frontend automatically discovers available engines

### 2. **Repository Pattern**
- Data access is abstracted through repository classes
- Engines interact with data through repositories, not direct models
- Reduces coupling between engines and database structure
- Enables easier testing and mocking

### 3. **Configuration Management**
- All engine settings stored in database
- Feature flags for gradual rollouts
- Runtime configuration changes without code deployment
- Environment-specific configurations

### 4. **Execution Monitoring**
- Every engine execution is tracked and logged
- Health monitoring for all engines
- Performance metrics collection
- Error tracking and debugging support

### 5. **API Versioning**
- Multiple API versions supported simultaneously
- Backward compatibility maintained
- Gradual deprecation of old endpoints

## Engine Contract

Every engine must implement the `BaseEngine` interface:

```python
class BaseEngine(ABC):
    @abstractmethod
    def get_metadata(self) -> EngineMetadata:
        """Return engine information and capabilities"""
        pass
    
    @abstractmethod
    def validate_input(self, input_data: Dict) -> List[EngineValidationError]:
        """Validate input before execution"""
        pass
    
    @abstractmethod
    def execute(self, input_data: Dict, db: Session) -> EngineExecutionResult:
        """Execute engine logic"""
        pass
    
    @abstractmethod
    def get_status(self, execution_id: str) -> EngineStatus:
        """Get execution status"""
        pass
    
    @abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """Check engine health"""
        pass
```

## Engine Registration

Engines self-register on import:

```python
# services/engine1/__init__.py
from app.core.engine_registry import EngineRegistry
from .scheduler import SchedulingEngine

# Auto-register on import
EngineRegistry.register(SchedulingEngine())
```

## Adding a New Engine

To add Engine 5:

1. **Create engine module**: `services/engine5/`
2. **Implement BaseEngine**: Follow the interface contract
3. **Register engine**: Import in `__init__.py`
4. **Add configuration**: Database entry (optional)
5. **Add tests**: Contract and unit tests
6. **Deploy**: No changes to existing code needed

**Files Modified**: 0-2 (only new engine files)

## Data Flow

### Engine Execution Flow
1. Frontend discovers engines via `/api/engines`
2. User selects engine to execute
3. Frontend calls `/api/engines/{name}/execute`
4. System validates input against engine contract
5. Engine executes with monitoring and logging
6. Results returned to frontend with execution tracking
7. Status can be monitored via `/api/engines/{name}/status/{id}`

### Configuration Flow
1. Engines load configuration from database
2. Feature flags control engine behavior
3. Configuration can be updated at runtime
4. Changes take effect immediately

### Monitoring Flow
1. All executions logged to `engine_executions` table
2. Health checks run periodically
3. Metrics collected and exposed via API
4. Dashboards display real-time status

## Security

- **Authentication**: JWT tokens with role-based access
- **Authorization**: Engine-level permissions
- **Input Validation**: All engine inputs validated
- **Audit Logging**: All actions tracked
- **Rate Limiting**: API rate limits prevent abuse

## Scalability Features

- **Horizontal Scaling**: Add more engines without limits
- **Configuration Management**: Runtime configuration changes
- **Feature Flags**: Gradual rollout of new features
- **Health Monitoring**: Proactive issue detection
- **Repository Pattern**: Database abstraction for performance
- **API Versioning**: Backward-compatible evolution

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: SQLAlchemy 2.0
- **Authentication**: JWT with passlib
- **Optimization**: Google OR-Tools (Engine 1)
- **Documentation**: Automatic OpenAPI/Swagger

### Frontend
- **Framework**: Next.js 14 (TypeScript)
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **API Client**: Axios
- **UI Components**: Custom component library

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Development**: Hot reload, live updates
- **Database Migrations**: Alembic
- **Testing**: pytest (backend), Jest (frontend)
- **Documentation**: Comprehensive markdown docs

## Migration Path

The system supports gradual migration from the current architecture:

### Phase 1: Foundation (✅ Complete)
- Engine interface created
- Registry system implemented
- Monitoring infrastructure added
- New API endpoints created

### Phase 2: Engine Migration (In Progress)
- Existing engines implement BaseEngine
- Repository pattern introduced
- Configuration management added
- Frontend updated for dynamic discovery

### Phase 3: Advanced Features (Future)
- Async task queue
- Event-driven architecture
- Advanced monitoring/alerting
- Multi-tenant support

## Design Decisions

### Why Plugin Architecture?
- **Extensibility**: Easy to add new examination logic
- **Maintainability**: Each engine is independently testable
- **Scalability**: System grows without architectural changes
- **Team Productivity**: Parallel development of engines

### Why Repository Pattern?
- **Decoupling**: Engines not tied to specific database schema
- **Testing**: Easy to mock data layer
- **Performance**: Query optimization in one place
- **Flexibility**: Can switch storage backends if needed

### Why Configuration Database?
- **Runtime Changes**: No deployments for config updates
- **Feature Flags**: Gradual rollout capabilities
- **Environment Specific**: Different configs per environment
- **Audit Trail**: Track who changed what when

This architecture enables ExamGuard to scale from 4 engines to 40+ engines without major structural changes, while maintaining performance, security, and maintainability.