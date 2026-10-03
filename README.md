# ExamGuard - Intelligent Examination Management System v2.0

**Plugin-based, multi-engine examination management system** with dynamic engine discovery and universal API access.

## 🚀 Plugin Architecture Overview

ExamGuard v2.0 introduces a **revolutionary plugin-based engine architecture** that enables:
- ✅ **Zero-Code Engine Addition**: Add new engines without modifying existing code
- ✅ **Dynamic Discovery**: Frontend automatically finds and integrates new engines  
- ✅ **Universal API**: Same endpoints work for all engines
- ✅ **Independent Development**: Teams can develop engines in parallel
- ✅ **Runtime Configuration**: Change engine behavior without deployments

```
┌─────────────────────────────────────────────────────────────┐
│                    PLUGIN ARCHITECTURE                       │
│                                                              │
│  Engine Registry → Universal API → Dynamic Frontend         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Engine 1   │  │   Engine 2   │  │   Engine 3   │      │
│  │ Scheduling   │  │ Room/Seating │  │ Invigilators │      │
│  │ (OR-Tools)   │  │ (Allocation) │  │ (Management) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Engine N   │  │   Engine N+1 │  │   Future...  │      │
│  │  (Add new    │  │  (plugins)   │  │  (plugins)   │      │
│  │   engines)   │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Core Engine Capabilities

### 🧠 Engine 1: Conflict-Optimized Scheduler  
**API**: `/api/engines/v2/engine1-scheduling/execute`
- **Algorithm**: Google OR-Tools CP-SAT constraint programming
- **Capabilities**: Exam scheduling, conflict detection, optimization
- **Input**: Course list, date range, session preferences
- **Output**: Optimal exam timetable with no student conflicts

### 🏢 Engine 2: Smart Room & Seating Allocator
**API**: `/api/engines/v2/engine2-room-seating/execute`  
- **Algorithm**: First-Fit Decreasing + Branch separation
- **Capabilities**: Room allocation, seat assignment, capacity optimization
- **Input**: Scheduled exams, room constraints, seating rules
- **Output**: Room assignments + exact seat positions with branch separation

### 👨‍🏫 Engine 3: Intelligent Invigilator Manager
**API**: `/api/engines/v2/engine3-invigilator/execute`
- **Algorithm**: Balanced assignment with eligibility validation
- **Capabilities**: Duty assignment, eligibility checking, workload balancing
- **Input**: Exam schedule, faculty availability, workload preferences  
- **Output**: Balanced invigilator assignments with notifications

### 📊 Universal Engine Discovery
**API**: `/api/engines/v2/`
```json
{
  "engines": [
    {
      "name": "engine1-scheduling",
      "display_name": "Conflict-Optimized Scheduler",
      "capabilities": ["exam_scheduling", "conflict_detection"],
      "execution_order": 0,
      "health": "healthy"
    },
    // ... more engines automatically discovered
  ]
}
```

## 🔌 Adding New Engines

**Revolutionary Simplicity**: Add Engine 5 in 3 steps, modify 0-2 existing files:

```python
# 1. Create engine class implementing BaseEngine
class Engine5CustomEngine(BaseEngine):
    def get_metadata(self): 
        return EngineMetadata(name="engine5-custom", ...)
    def execute(self, input_data, db): 
        # Your logic here
        return EngineExecutionResult(...)

# 2. Register in startup (app/main.py) 
engine_registry.register(Engine5CustomEngine())

# 3. Engine immediately available at:
# GET /api/engines/v2/engine5-custom/metadata
# POST /api/engines/v2/engine5-custom/execute
```

**That's it!** Frontend automatically discovers and integrates the new engine.

## 🛠️ Architecture Transformation

### Before: Hardcoded Engine Integration
- ❌ Adding Engine 5 required **8-12 file modifications**
- ❌ Frontend needed manual updates for each engine
- ❌ API endpoints had to be individually created
- ❌ No standardized monitoring or health checking

### After: Plugin-Based Architecture  
- ✅ Adding Engine 5 requires **0-2 file modifications**
- ✅ Frontend automatically discovers all engines
- ✅ Universal API works for all engines  
- ✅ Built-in monitoring, health checks, and execution tracking

### Rules & Configuration Layer

Stores all exam-type rules as **data** (never hard-coded):
- Exam duration, students per bench
- Minimum gap days, invigilator ratios
- Example: ISA-1/ISA-2 = 1hr, 2/bench, 1 day gap, 1:30 ratio
- Example: ESA = 3hr, 1/bench, 2 day gap, 1:24 ratio (min 2/room)

## Tech Stack

### Backend - Plugin Architecture
- **Python 3.11** with FastAPI
- **SQLAlchemy 2.0** with Alembic migrations  
- **Plugin System**: BaseEngine interface + EngineRegistry
- **Universal API**: `/api/engines/v2/*` endpoints
- **Monitoring**: Execution tracking + health checks
- **Configuration**: Database-driven engine settings
- **OR-Tools** (Engine 1), **pandas/openpyxl** (reporting)

### Frontend - Dynamic Engine Integration
- **Next.js 14** (TypeScript) with Tailwind CSS
- **Dynamic Discovery**: Auto-detects available engines
- **Generic Components**: Universal engine execution UI
- **Real-time Monitoring**: Execution status tracking
- **shadcn/ui** component library

### Database & Infrastructure
- **PostgreSQL** (production) / **SQLite** (development)  
- **Docker Compose** with multi-container deployment
- **JWT Authentication** with RBAC
- **Comprehensive Testing** (pytest + Jest)

## Project Structure

```
examguard/
├── backend/
│   ├── alembic/              # Database migrations
│   ├── app/
│   │   ├── core/             # Config, security, dependencies
│   │   │   ├── engine_interface.py     # BaseEngine contract
│   │   │   ├── engine_registry.py      # Plugin registry
│   │   │   ├── engine_monitor.py       # Execution tracking
│   │   │   └── config_manager.py       # Runtime configuration
│   │   ├── models/           # SQLAlchemy models
│   │   │   ├── engine_execution.py     # Execution tracking
│   │   │   └── engine_configuration.py # Engine settings
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── api/              # API routes
│   │   │   ├── engines.py              # Legacy engine API
│   │   │   └── engines_v2.py           # Universal plugin API
│   │   ├── services/         # Business logic (Plugin Engines)
│   │   │   ├── rules/        # Rules & Configuration layer
│   │   │   ├── engine1/      # Scheduling engine (BaseEngine)
│   │   │   ├── engine2/      # Room & Seating engine (BaseEngine)  
│   │   │   ├── engine3/      # Invigilator engine (BaseEngine)
│   │   │   └── engine4/      # Validation & Reporting engine
│   │   └── utils/            # Helpers
│   ├── tests/
│   ├── requirements.txt
│   └── main.py               # Engine registration on startup
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   ├── components/       # React components
│   │   │   ├── engine/       # Generic engine UI components
│   │   │   └── dashboard/    # Engine monitoring dashboard
│   │   ├── lib/              # Utilities + engine discovery
│   │   └── types/            # TypeScript types
│   ├── package.json
│   └── tsconfig.json
├── docs/                     # Comprehensive documentation
│   ├── ARCHITECTURE.md       # Plugin architecture details
│   ├── ENGINES.md           # Engine specifications
│   └── API.md               # Universal API documentation
├── docker-compose.yml
└── README.md
```

## ⚡ Key Architecture Benefits

### 🔌 Plugin-First Design
1. **Zero-Code Scaling**: Add engines without touching existing codebase
2. **Universal API**: Same endpoints for all engines (`/api/engines/v2/*`)
3. **Dynamic Frontend**: UI automatically adapts to new engines
4. **Independent Development**: Teams work on engines in parallel

### 📊 Built-in Observability  
1. **Execution Tracking**: Every engine run monitored and logged
2. **Health Monitoring**: Real-time engine health and dependency status
3. **Performance Metrics**: Execution times, success rates, error tracking
4. **Configuration Management**: Runtime settings without deployments

### 🛡️ Enterprise-Grade Features
1. **Input Validation**: Schema-based validation for all engines
2. **Error Handling**: Standardized error responses and rollback support
3. **Security**: JWT authentication with role-based engine access
4. **Audit Trail**: Complete history of all engine executions

## 🎯 Key Design Principles

1. **Rule-Based Configuration**: All rule numbers read through RuleProvider
2. **Engine Independence**: Engine 4 audits independently (no imports from 1-3)
3. **Type Safety**: All functions typed with docstrings
4. **Plan Versioning**: What-if scenarios never overwrite published plans
5. **Audit Trail**: Every change recorded in audit log
6. **Test Coverage**: Unit tests for every module

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Backend API: http://localhost:8000
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

### Local Development

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

Create `.env` files in backend and frontend directories:

### Backend `.env`
```
DATABASE_URL=postgresql://examguard:examguard@localhost:5432/examguard
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## License

Proprietary - KLE Technological University
