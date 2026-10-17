# Contributing to ExamGuard

Thank you for your interest in contributing to ExamGuard! This guide will help you get started with development and understand our contribution process.

## Table of Contents

- [Project Overview](#project-overview)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Adding a New Engine (Plugin)](#adding-a-new-engine-plugin)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)

## Project Overview

ExamGuard is an intelligent multi-engine examination management system built with:
- **Backend**: FastAPI (Python 3.11+), SQLAlchemy 2.0, PostgreSQL
- **Frontend**: Next.js 14 (TypeScript), React 18, Tailwind CSS
- **Architecture**: Plugin-based engine system with dynamic discovery

### Key Design Principles
1. **Plugin-First**: Engines are plugins that implement a common interface
2. **Rules as Data**: Configuration stored in database, not hardcoded
3. **Engine Independence**: Engine 4 audits independently (no imports from 1-3)
4. **Type Safety**: Full type hints (Python) and strict TypeScript mode
5. **Immutable Published Plans**: What-if scenarios create versions, published plans locked

## Development Environment Setup

### Prerequisites

- **Docker Desktop**: Version 20.10+ (for containerized development)
- **Node.js**: Version 18.x or higher ([download](https://nodejs.org/))
- **Python**: Version 3.11+ ([download](https://www.python.org/downloads/))
- **PostgreSQL**: Version 14+ (managed via Docker or local)
- **Git**: For version control

### Initial Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd examguard

# 2. Start services with Docker
docker-compose up -d

# 3. Verify services are running
docker-compose ps

# 4. Check logs if needed
docker-compose logs backend
docker-compose logs frontend
```

### Backend Local Development

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Create initial admin user (if needed)
python -m app.utils.init_db

# Start development server
uvicorn app.main:app --reload

# Backend available at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Frontend Local Development

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with backend API URL

# Start development server
npm run dev

# Frontend available at http://localhost:3000
```

### Database Management

```bash
# Create a new migration after model changes
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Check current migration
alembic current

# View migration history
alembic history
```

## Project Structure

```
examguard/
├── backend/                    # Python FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI app entry & engine registration
│   │   ├── core/              # Core infrastructure
│   │   │   ├── config.py      # Settings & configuration
│   │   │   ├── security.py    # JWT & password hashing
│   │   │   ├── database.py    # DB connection & session
│   │   │   ├── dependencies.py # FastAPI dependencies & auth
│   │   │   ├── engine_interface.py  # BaseEngine contract
│   │   │   └── engine_registry.py   # Plugin registry
│   │   ├── models/            # SQLAlchemy ORM models
│   │   │   ├── user.py        # User model with roles
│   │   │   ├── course.py      # Course model
│   │   │   ├── student.py     # Student model
│   │   │   ├── room.py        # Room & bench models
│   │   │   ├── rule.py        # Rule configuration
│   │   │   └── audit_log.py   # Audit trail
│   │   ├── schemas/           # Pydantic validation schemas
│   │   ├── api/               # API route handlers
│   │   │   ├── auth.py        # Authentication endpoints
│   │   │   ├── users.py       # User management
│   │   │   ├── engines_v2.py  # Universal plugin API
│   │   │   └── ...
│   │   ├── services/          # Business logic layer
│   │   │   ├── rules/         # Rules & configuration
│   │   │   ├── engine1/       # Scheduling engine
│   │   │   ├── engine2/       # Room & seating engine
│   │   │   ├── engine3/       # Invigilator management
│   │   │   └── engine4/       # Validation & reporting
│   │   └── utils/             # Helper functions
│   ├── tests/                 # Unit & integration tests
│   ├── alembic/               # Database migrations
│   └── requirements.txt       # Python dependencies
│
└── frontend/                  # Next.js React frontend
    ├── src/
    │   ├── app/               # Next.js 14 App Router pages
    │   ├── components/        # React components
    │   ├── lib/               # Utilities & API client
    │   └── types/             # TypeScript type definitions
    ├── tests/                 # Frontend tests
    └── package.json           # Node dependencies
```

### Key Directories

- **backend/app/services/**: All engine implementations and business logic
- **backend/app/api/**: REST API endpoints grouped by resource
- **backend/app/models/**: Database table definitions
- **backend/app/schemas/**: Request/response validation schemas
- **frontend/src/app/**: Page routes (Next.js App Router)
- **frontend/src/components/**: Reusable React components

## Coding Standards

### Backend (Python)

#### General Guidelines
- **Python Version**: 3.11+
- **Style Guide**: PEP 8
- **Type Hints**: Required for all functions
- **Docstrings**: Required for public functions and classes

#### Code Formatting
```python
# Use type hints
def calculate_schedule(
    courses: list[Course],
    start_date: date,
    end_date: date,
    timeout: int = 60
) -> ScheduleResult:
    """
    Generate exam schedule using constraint programming.
    
    Args:
        courses: List of courses to schedule
        start_date: First possible exam date
        end_date: Last possible exam date
        timeout: Solver timeout in seconds
        
    Returns:
        ScheduleResult with optimized timetable
        
    Raises:
        ValidationError: If input data is invalid
        SchedulingError: If no feasible solution exists
    """
    pass
```

#### FastAPI Patterns
```python
# Use dependency injection
from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user, get_db

router = APIRouter()

@router.get("/plans")
async def list_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> list[PlanResponse]:
    """List all exam plans accessible to current user."""
    pass
```

#### Database Models
```python
# Use SQLAlchemy 2.0 style
from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

class Course(Base):
    __tablename__ = "courses"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    
    # Relationships
    students: Mapped[list["Student"]] = relationship(
        secondary="student_courses",
        back_populates="courses"
    )
```

#### Testing
```python
# Use pytest with fixtures
import pytest
from fastapi.testclient import TestClient

def test_create_plan(client: TestClient, auth_headers: dict):
    """Test exam plan creation."""
    response = client.post(
        "/api/plans",
        json={"name": "ISA-1 2024", "exam_type": "ISA1"},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["name"] == "ISA-1 2024"
```

### Frontend (TypeScript/React)

#### General Guidelines
- **TypeScript**: Strict mode enabled
- **React**: Function components with hooks
- **Styling**: Tailwind CSS utility classes
- **State Management**: React Context for global state

#### Component Structure
```typescript
// Use TypeScript interfaces
interface ExamPlanCardProps {
  plan: ExamPlan;
  onSelect: (id: number) => void;
  isSelected?: boolean;
}

// Function components with proper typing
export function ExamPlanCard({ 
  plan, 
  onSelect, 
  isSelected = false 
}: ExamPlanCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{plan.name}</h3>
      <button onClick={() => onSelect(plan.id)}>
        Select Plan
      </button>
    </div>
  );
}
```

#### API Integration
```typescript
// Define types for API responses
interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Use async/await with proper error handling
async function fetchPlans(): Promise<ExamPlan[]> {
  try {
    const response = await fetch('/api/plans', {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch plans: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
}
```

#### Form Handling
```typescript
// Use react-hook-form with zod validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const planSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  examType: z.enum(['ISA1', 'ISA2', 'ESA']),
  academicYear: z.string().regex(/^\d{4}-\d{2}$/),
});

type PlanFormData = z.infer<typeof planSchema>;

export function PlanForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
  });
  
  const onSubmit = async (data: PlanFormData) => {
    // Handle form submission
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## Adding a New Engine (Plugin)

ExamGuard's plugin architecture makes adding new engines straightforward.

### Step 1: Implement BaseEngine Interface

```python
# backend/app/services/engine5/engine.py
from app.core.engine_interface import (
    BaseEngine,
    EngineMetadata,
    EngineExecutionResult,
    EngineCapability
)
from sqlalchemy.orm import Session

class Engine5CustomEngine(BaseEngine):
    """Custom engine for [describe purpose]."""
    
    def get_metadata(self) -> EngineMetadata:
        """Return engine metadata for discovery."""
        return EngineMetadata(
            name="engine5-custom",
            display_name="Custom Engine",
            description="Description of what this engine does",
            version="1.0.0",
            capabilities=[
                EngineCapability.CUSTOM_FEATURE
            ],
            execution_order=4,
            input_schema={
                "type": "object",
                "properties": {
                    "param1": {"type": "string"},
                    "param2": {"type": "integer"}
                },
                "required": ["param1"]
            }
        )
    
    def validate_input(self, input_data: dict) -> tuple[bool, str]:
        """Validate input data before execution."""
        if "param1" not in input_data:
            return False, "param1 is required"
        return True, ""
    
    def execute(
        self, 
        input_data: dict, 
        db: Session
    ) -> EngineExecutionResult:
        """Execute the engine logic."""
        try:
            # Your engine logic here
            result_data = {
                "status": "success",
                "processed": True
            }
            
            return EngineExecutionResult(
                success=True,
                data=result_data,
                message="Engine executed successfully",
                metadata={"execution_time": "2.5s"}
            )
        except Exception as e:
            return EngineExecutionResult(
                success=False,
                data={},
                message=f"Engine execution failed: {str(e)}",
                errors=[str(e)]
            )
    
    def get_health(self) -> dict:
        """Check engine health and dependencies."""
        return {
            "healthy": True,
            "dependencies": {
                "database": "connected",
                "external_api": "available"
            }
        }
```

### Step 2: Register Engine on Startup

```python
# backend/app/main.py
from app.services.engine5.engine import Engine5CustomEngine

# In startup event or main app initialization
@app.on_event("startup")
async def startup_event():
    """Register all engines on startup."""
    # ... existing engines ...
    
    # Register new engine
    engine_registry.register(Engine5CustomEngine())
```

### Step 3: Test Your Engine

```python
# backend/tests/test_engine5.py
import pytest
from app.services.engine5.engine import Engine5CustomEngine

def test_engine_metadata():
    """Test engine metadata is correct."""
    engine = Engine5CustomEngine()
    metadata = engine.get_metadata()
    
    assert metadata.name == "engine5-custom"
    assert metadata.version == "1.0.0"

def test_engine_execution(db_session):
    """Test engine executes successfully."""
    engine = Engine5CustomEngine()
    input_data = {"param1": "test"}
    
    result = engine.execute(input_data, db_session)
    
    assert result.success is True
    assert "processed" in result.data
```

### Step 4: Use the Engine

The engine is now automatically available via the universal API:

```bash
# Discover the new engine
GET /api/engines/v2/

# Get engine metadata
GET /api/engines/v2/engine5-custom/metadata

# Execute the engine
POST /api/engines/v2/engine5-custom/execute
{
  "param1": "test",
  "param2": 123
}

# Check execution status
GET /api/engines/v2/engine5-custom/status/{execution_id}
```

The frontend will automatically discover and display the new engine!

## Testing Guidelines

### Backend Testing

#### Unit Tests
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_engine1.py

# Run with coverage
pytest --cov=app --cov-report=html

# Run with verbose output
pytest -v

# Run tests matching pattern
pytest -k "schedule"
```

#### Test Structure
```python
# tests/conftest.py - Shared fixtures
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture
def db_session():
    """Create test database session."""
    engine = create_engine("sqlite:///:memory:")
    TestingSessionLocal = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db_session):
    """Create test client."""
    app.dependency_overrides[get_db] = lambda: db_session
    return TestClient(app)

@pytest.fixture
def auth_headers(client):
    """Get authentication headers."""
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "test123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

### Frontend Testing

#### Unit Tests
```bash
# Run unit tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- ExamPlanCard.test.tsx
```

#### Component Testing
```typescript
// components/ExamPlanCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ExamPlanCard } from './ExamPlanCard';

describe('ExamPlanCard', () => {
  const mockPlan = {
    id: 1,
    name: 'ISA-1 2024',
    examType: 'ISA1',
  };
  
  it('renders plan name', () => {
    render(<ExamPlanCard plan={mockPlan} onSelect={() => {}} />);
    expect(screen.getByText('ISA-1 2024')).toBeInTheDocument();
  });
  
  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<ExamPlanCard plan={mockPlan} onSelect={onSelect} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
```

#### End-to-End Tests
```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

### Test Coverage Requirements
- **Minimum Coverage**: 70% for new code
- **Critical Paths**: 90%+ coverage for engine logic, authentication, data validation
- **Pull Requests**: Must include tests for new features and bug fixes

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring (neither fixes a bug nor adds a feature)
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build config, etc.)

### Examples
```bash
# Feature addition
feat(engine2): add support for multi-campus room allocation

# Bug fix
fix(auth): resolve token expiration issue on page refresh

# Documentation
docs(api): add examples for engine execution endpoints

# Refactoring
refactor(engine1): optimize conflict graph generation algorithm

# Tests
test(seating): add unit tests for branch separation logic

# Chore
chore(deps): upgrade FastAPI to 0.109.0
```

### Scope Guidelines
- **Backend**: `auth`, `api`, `engine1`, `engine2`, `engine3`, `engine4`, `models`, `schemas`
- **Frontend**: `ui`, `components`, `pages`, `api-client`
- **Infrastructure**: `docker`, `db`, `ci`, `deps`

## Pull Request Process

### Before Creating a PR

1. **Create a Feature Branch**
   ```bash
   # Branch naming convention
   git checkout -b feature/add-engine5-custom
   git checkout -b fix/auth-token-expiry
   git checkout -b docs/update-api-reference
   ```

2. **Make Your Changes**
   - Follow coding standards
   - Write tests for new functionality
   - Update documentation as needed

3. **Run Tests Locally**
   ```bash
   # Backend
   cd backend
   pytest
   
   # Frontend
   cd frontend
   npm test
   npm run test:e2e
   ```

4. **Commit Your Changes**
   ```bash
   git add <files>
   git commit -m "feat(engine5): implement custom engine plugin"
   ```

### Creating the PR

1. **Push Your Branch**
   ```bash
   git push -u origin feature/add-engine5-custom
   ```

2. **Open Pull Request**
   - Use GitHub web interface to create PR
   - Fill out PR template completely
   - Link related issues

3. **PR Title**: Follow commit message format
   ```
   feat(engine5): implement custom engine plugin
   ```

4. **PR Description Template**:
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Changes Made
   - Implemented Engine5CustomEngine
   - Added tests for engine validation
   - Updated API documentation
   
   ## Testing Done
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed
   
   ## Documentation Updated
   - [ ] README.md
   - [ ] API documentation
   - [ ] Code comments
   
   ## Related Issues
   Closes #123
   ```

### PR Review Process

1. **Automated Checks**: CI runs tests and linting
2. **Code Review**: At least one approval required
3. **Address Feedback**: Make requested changes
4. **Approval**: Once approved, PR can be merged
5. **Merge**: Squash and merge preferred for cleaner history

## Code Review Guidelines

### For Reviewers

#### What to Look For
- **Correctness**: Does the code work as intended?
- **Tests**: Are there adequate tests?
- **Security**: Any security vulnerabilities?
- **Performance**: Any performance concerns?
- **Style**: Follows coding standards?
- **Documentation**: Adequately documented?

#### Review Checklist
- [ ] Code follows project conventions
- [ ] Tests are included and pass
- [ ] No security vulnerabilities introduced
- [ ] Documentation updated where needed
- [ ] Commit messages follow conventions
- [ ] No unnecessary dependencies added

#### Providing Feedback
- Be specific and constructive
- Explain the "why" behind suggestions
- Distinguish between required changes and suggestions
- Approve when ready, even with minor suggestions

### For Authors

#### Responding to Feedback
- Address all comments (even if just to acknowledge)
- Ask questions if feedback is unclear
- Push additional commits to address feedback
- Mark conversations as resolved when addressed

## Getting Help

### Resources
- **Documentation**: Check [docs/](docs/) directory
- **API Reference**: [docs/API.md](docs/API.md)
- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Contact
- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Development Team**: For complex technical questions

---

**Thank you for contributing to ExamGuard! Your efforts help improve examination management for educational institutions.**
