# ExamGuard Project Structure

## Overview

This document outlines the complete directory structure of the ExamGuard examination management system.

## Directory Tree

```
examguard/
│
├── docker-compose.yml          # Docker orchestration
├── .gitignore                  # Git ignore patterns
├── README.md                   # Main project documentation
└── STRUCTURE.md                # This file
│
├── backend/                    # Python FastAPI backend
│   ├── Dockerfile
│   ├── requirements.txt        # Python dependencies
│   ├── pytest.ini              # Pytest configuration
│   ├── alembic.ini             # Alembic migrations config
│   ├── .env.example            # Environment variables template
│   │
│   ├── alembic/                # Database migrations
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   ├── README
│   │   └── versions/           # Migration files (auto-generated)
│   │
│   ├── app/                    # Main application code
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app entry point
│   │   │
│   │   ├── core/               # Core functionality
│   │   │   ├── __init__.py
│   │   │   ├── config.py       # Settings & configuration
│   │   │   ├── security.py     # JWT, password hashing
│   │   │   ├── database.py     # DB connection & session
│   │   │   └── dependencies.py # FastAPI dependencies & auth
│   │   │
│   │   ├── models/             # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── base.py         # Base model class
│   │   │   ├── user.py         # User model (TO BE CREATED)
│   │   │   ├── course.py       # Course model (TO BE CREATED)
│   │   │   ├── student.py      # Student model (TO BE CREATED)
│   │   │   ├── room.py         # Room model (TO BE CREATED)
│   │   │   ├── rule.py         # Rule configuration (TO BE CREATED)
│   │   │   ├── plan.py         # Exam plan versions (TO BE CREATED)
│   │   │   └── audit_log.py    # Audit trail (TO BE CREATED)
│   │   │
│   │   ├── schemas/            # Pydantic validation schemas
│   │   │   ├── __init__.py
│   │   │   └── (TO BE CREATED)
│   │   │
│   │   ├── api/                # API route handlers
│   │   │   ├── __init__.py
│   │   │   └── (TO BE CREATED)
│   │   │
│   │   ├── services/           # Business logic layer
│   │   │   ├── __init__.py
│   │   │   │
│   │   │   ├── rules/          # Rules & Configuration Layer
│   │   │   │   ├── __init__.py
│   │   │   │   ├── rule_provider.py    # Rule data access (TO BE CREATED)
│   │   │   │   └── rule_validator.py   # Rule validation (TO BE CREATED)
│   │   │   │
│   │   │   ├── engine1/        # Scheduling Engine
│   │   │   │   ├── __init__.py
│   │   │   │   ├── conflict_graph.py   # Build conflict graph (TO BE CREATED)
│   │   │   │   ├── scheduler.py        # OR-Tools scheduling (TO BE CREATED)
│   │   │   │   └── clash_detector.py   # Detect student clashes (TO BE CREATED)
│   │   │   │
│   │   │   ├── engine2/        # Room & Seating Engine
│   │   │   │   ├── __init__.py
│   │   │   │   ├── room_allocator.py   # Allocate rooms (TO BE CREATED)
│   │   │   │   └── seat_allocator.py   # Assign exact seats (TO BE CREATED)
│   │   │   │
│   │   │   ├── engine3/        # Exam Management Engine
│   │   │   │   ├── __init__.py
│   │   │   │   ├── invigilator_manager.py  # Duty assignment (TO BE CREATED)
│   │   │   │   ├── workload_balancer.py    # Fair distribution (TO BE CREATED)
│   │   │   │   └── notification_service.py # Alerts (TO BE CREATED)
│   │   │   │
│   │   │   └── engine4/        # Validation & Reporting Engine
│   │   │       ├── __init__.py
│   │   │       ├── validator.py        # Independent rule checker (TO BE CREATED)
│   │   │       ├── compliance_scorer.py # Calculate scores (TO BE CREATED)
│   │   │       ├── report_generator.py  # PDF/Excel exports (TO BE CREATED)
│   │   │       └── conflict_dashboard.py # Conflict analysis (TO BE CREATED)
│   │   │
│   │   └── utils/              # Utility functions
│   │       ├── __init__.py
│   │       └── (TO BE CREATED)
│   │
│   └── tests/                  # Unit and integration tests
│       ├── __init__.py
│       ├── conftest.py         # Pytest fixtures
│       └── (TO BE CREATED)
│
└── frontend/                   # Next.js React frontend
    ├── Dockerfile
    ├── package.json            # Node dependencies
    ├── tsconfig.json           # TypeScript config
    ├── tailwind.config.ts      # Tailwind CSS config
    ├── postcss.config.js       # PostCSS config
    ├── next.config.js          # Next.js config
    ├── .eslintrc.json          # ESLint config
    ├── .env.local.example      # Environment variables template
    │
    └── src/
        ├── app/                # Next.js 14 app directory
        │   ├── layout.tsx      # Root layout
        │   ├── page.tsx        # Home page
        │   ├── globals.css     # Global styles
        │   └── (TO BE CREATED)
        │
        ├── components/         # React components
        │   └── (TO BE CREATED)
        │
        ├── lib/                # Utility functions
        │   ├── api.ts          # API client
        │   └── (TO BE CREATED)
        │
        └── types/              # TypeScript type definitions
            └── (TO BE CREATED)
```

## Key Design Principles

### 1. Rules as Data
All exam rules (duration, students/bench, gaps, ratios) stored in database, accessed via `RuleProvider`.

### 2. Engine Independence
Engine 4 (Validation) **must not** import from Engines 1-3. It audits independently.

### 3. Plan Versioning
What-if scenarios create new plan versions; published plans remain immutable.

### 4. Audit Trail
All changes recorded in `audit_log` table with user, timestamp, and change details.

### 5. Type Safety
- Backend: Python type hints, Pydantic schemas
- Frontend: TypeScript strict mode

## Next Steps

1. ✅ Project structure created
2. ⏳ Build Rules & Configuration layer
3. ⏳ Implement database models
4. ⏳ Create Engine 1 (Scheduling)
5. ⏳ Create Engine 2 (Room & Seating)
6. ⏳ Create Engine 3 (Exam Management)
7. ⏳ Create Engine 4 (Validation)
8. ⏳ Build API endpoints
9. ⏳ Create frontend UI
10. ⏳ Add tests and documentation
