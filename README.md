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

## System Requirements

### Production
- **Operating System**: Linux (Ubuntu 20.04+), Windows Server 2019+, macOS 11+
- **Memory**: 8GB RAM minimum (16GB recommended for production)
- **Storage**: 50GB available space (SSD recommended)
- **Processor**: 4+ CPU cores

### Development
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Node.js**: Version 18.x or higher
- **Python**: Version 3.11+
- **PostgreSQL**: Version 14+ (managed via Docker)

## Quick Start

### Prerequisites
- Docker & Docker Compose installed and running
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
- Git for version control

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd examguard

# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps

# Initialize database (first time only)
docker-compose exec backend alembic upgrade head

# Access the system
# Backend API: http://localhost:8000
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs

# Default login credentials
# Email: admin@kletu.ac.in
# Password: admin123
```

**Common Startup Issues**: If services fail to start, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

### Local Development

#### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload

# Backend will be available at http://localhost:8000
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with backend API URL

# Start development server
npm run dev

# Frontend will be available at http://localhost:3000
```

## Running Tests

### Backend Tests
```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # Windows: venv\Scripts\activate

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_engine1.py

# Run with verbose output
pytest -v
```

### Frontend Tests
```bash
cd frontend

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run integration tests
npm run test:integration
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

### Backend Environment (`.env`)
Create `backend/.env` based on `.env.example`:

```env
# Database Configuration
DATABASE_URL=postgresql://examguard:examguard@localhost:5432/examguard

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["http://localhost:3000"]

# Environment
ENVIRONMENT=development
DEBUG=true
```

### Frontend Environment (`.env.local`)
Create `frontend/.env.local` based on `.env.local.example`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Environment
NODE_ENV=development
```

## 📚 Documentation

Complete documentation is available in the [`docs/`](docs/) directory:

### Core Documentation
- **[Architecture Guide](docs/ARCHITECTURE.md)** - System design, plugin architecture, technical overview
- **[API Reference](docs/API.md)** - Complete REST API documentation with examples
- **[User Guide](docs/USER_GUIDE.md)** - Role-based usage instructions
- **[Engine Specifications](docs/ENGINES.md)** - Detailed algorithms for all four engines

### Quick Reference
- **[Quick Start](docs/QUICK_START.md)** - Get running in 5 minutes
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[FAQ](docs/FAQ.md)** - Frequently asked questions
- **[Database Schema](docs/DATABASE.md)** - Data model and relationships

### For Developers
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute to ExamGuard
- **[Development Guide](docs/DEVELOPMENT.md)** - Development environment and patterns
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions

### For Administrators
- **[Operations Guide](docs/OPERATIONS.md)** - Production operations and maintenance
- **[Security Guide](docs/SECURITY.md)** - Security features and best practices

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for:
- Development environment setup
- Coding standards and conventions
- Testing requirements
- Git workflow and PR process
- Adding new plugin engines

## 🔒 Security

### Production Deployment Checklist
Before deploying to production, review:
- [ ] Change default SECRET_KEY in backend `.env`
- [ ] Use strong passwords for admin accounts
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS/TLS certificates
- [ ] Set up database backups
- [ ] Configure CSP headers
- [ ] Review [Security Guide](docs/SECURITY.md)

For security issues, please see our security policy in the documentation.

## License

**Proprietary License** - KLE Technological University

This software is proprietary and confidential. Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited without explicit written permission from KLE Technological University.

## Support and Contact

For questions, issues, or contributions:
- **Documentation**: Check the [docs/](docs/) directory first
- **Issues**: Report bugs via GitHub Issues
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- **Troubleshooting**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues

---

**Version**: 2.0.0 (Plugin Architecture)  
**Last Updated**: January 2025  
**Maintained By**: ExamGuard Development Team, KLE Technological University
