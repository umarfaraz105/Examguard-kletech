# 🛡️ ExamGuard — Intelligent Examination Management System

<div align="center">

**A full-stack, multi-engine examination management platform for KLE Technological University's Dr. M. S. Sheshgiri Campus.**

[Status](#-project-status) · [Features](#-features) · [Architecture](#-architecture) · [Getting Started](#-getting-started) · [API](#-api-reference) · [Roadmap](#-roadmap)

</div>

---

> 🚧 **Work in progress.** ExamGuard is under active development. Steps 1–2 of the admin workflow are working end-to-end; the remaining steps, solver engines, and Google OCR integration are still being built. Expect breaking changes, incomplete pages, and evolving APIs until `v1.0`.

---

## 📖 Overview

ExamGuard aims to automate the complete internal examination lifecycle for KLE Tech's Internal Semester Assessments (**ISA**) and End Semester Assessments (**ESA**): from course registration uploads and data review, through conflict-free timetable generation and seating allocation, to invigilator duty assignment and final report generation.

The goal is to replace weeks of manual spreadsheet work with seconds of optimised computation, while enforcing data-quality gates at every stage and keeping a full audit trail of every change.

**Design principles**

- **Gated workflow:** each step must be confirmed before the next unlocks.
- **Nothing silently deleted:** re-opening a step marks downstream results `STALE`.
- **Rules live in the database:** solver engines read constraints from the DB, never hard-coded.
- **Additive-only migrations:** schema changes never destroy data.

---

## 📊 Project Status

| Area | Status |
|------|--------|
| Authentication & role-based access | ✅ Done |
| Admin shell, dashboard & workflow stepper | ✅ Done |
| Exam cycle + workflow gating (confirm / reopen / stale) | ✅ Done |
| Step 1 — Registration | ✅ Done |
| Step 2 — Review | ✅ Done |
| Step 3 — Rules | 🚧 Next up |
| Step 4 — Timetable (Engine 1) | 📅 Planned |
| Step 5 — Rooms | 📅 Planned |
| Step 6 — Seating (Engine 2) | 📅 Planned |
| Step 7 — Duty (Engine 3) | 📅 Planned |
| Google OCR document ingestion | 🚧 In development |
| ESA exam cycle support | 📅 Planned |
| Reports (PDF / Excel) | 📅 Planned |
| HOD / Faculty / Student dashboards | 📅 Planned |

---

## ✨ Features

### 🔐 Authentication & Role-Based Access ✅

- Five roles: **ADMIN**, **EXAM_CELL** (Staff), **HOD**, **FACULTY**, **STUDENT**
- Separate portals: hidden `/admin-login` for admins, public `/login` with role selector for everyone else
- JWT tokens with IP binding for admin sessions, CSRF protection, inactivity timeout
- Role guards on every API endpoint (401 / 403) and every frontend route

### 🗂️ Seven-Step Admin Workflow

| Step | Page | Description | Status |
|------|------|-------------|--------|
| 1 | **Registration** | HOD CSV/XLSX uploads, per-department status, row-level validation, error export | ✅ |
| 2 | **Review** | Course list with inline edit, "needs review" flagging, student-clash matrix | ✅ |
| 3 | **Rules** | Constraint toggles, parameter editing, modification history, preset save/load | 🚧 |
| 4 | **Timetable** | Async generation, drag-to-reschedule grid, conflict report, publish | 📅 |
| 5 | **Rooms** | Hall CRUD, rows × cols grid, usable-seat tracking, confirm inventory | 📅 |
| 6 | **Seating** | Async allocation, seat grid with course colour legend, fine-tune panel | 📅 |
| 7 | **Duty** | Async assignment, faculty × session roster, pick-logic settings | 📅 |
| — | **Reports** | Timetable, seating plans, duty rosters as PDF / Excel | 📅 |

### 🧠 Solver Engines

| Engine | Technology | Purpose | Status |
|--------|-----------|---------|--------|
| **Engine 1 — Scheduling** | Google OR-Tools CP-SAT | Conflict-free exam timetable respecting all DB rules | 🚧 In development |
| **Engine 2 — Room & Seating** | Constraint-based allocation | Multi-room assignment, department-mixing seating grid | 📅 Planned |
| **Engine 3 — Invigilator** | Weighted round-robin | Fair duty allocation with eligibility checks and workload balancing | 📅 Planned |

All engines are **async by design**: `POST` returns `202` + job ID, and the UI polls for progress. Feasible-but-not-optimal results are saved and flagged, never discarded.

### 📄 Google OCR Ingestion 🚧

- Extract data from scanned or photographed documents (e.g. registration sheets) using Google Cloud OCR
- Parsed rows feed the same validation pipeline as CSV/XLSX uploads (Step 1)
- Low-confidence fields are flagged for manual review before confirmation
- **Status:** still being built; interfaces and accuracy tuning will change

### 🏛️ Admin Dashboard ✅

- Live workflow stepper (7 steps, real DB state)
- Department upload status with progress bar
- "Next Required Action" banner derived from workflow state
- Open warnings section (extensible)
- Exam cycle selector (e.g. 2026-27 / ISA 1, ESA)

---

## 🏗️ Architecture

`````
┌──────────────────────────────────────────────┐
│   Next.js 14 (App Router)  — Port 3000       │
│   TypeScript · Tailwind CSS · React Context  │
└─────────────────────┬────────────────────────┘
                      │ REST / JSON
┌─────────────────────▼────────────────────────┐
│   FastAPI (Python 3.11)    — Port 8000       │
│   JWT Auth · CSRF · Rate Limiting · CORS     │
└─────────────────────┬────────────────────────┘
                      │ SQLAlchemy ORM
┌─────────────────────▼────────────────────────┐
│   SQLite (dev) / PostgreSQL (prod)           │
│   Alembic Migrations · Additive-only schema  │
└──────────────────────────────────────────────┘
`````

<details>
<summary><b>Backend structure</b></summary>

`````
backend/
├── app/
│   ├── api/              # Route handlers (auth, courses, rooms, engines, admin_*)
│   ├── models/           # SQLAlchemy models (User, Course, Plan, Room, …)
│   ├── schemas/          # Pydantic request/response schemas
│   ├── services/
│   │   ├── engine1/      # CP-SAT scheduler (scheduler.py, clash_detector.py)
│   │   ├── engine2/      # Room allocator + seating manager
│   │   ├── engine3/      # Invigilator manager + workload balancer
│   │   └── rules/        # RuleProvider — engines read rules from DB
│   └── core/             # Config, security, JWT, dependencies, rate limiter
├── alembic/              # Migrations (additive only, SQLite batch mode)
└── tests/
`````

</details>

<details>
<summary><b>Frontend structure</b></summary>

`````
frontend/src/
├── app/
│   ├── login/            # Role-selector login page
│   ├── admin-login/      # Hidden admin login page
│   └── dashboard/admin/  # Admin shell + workflow pages
│       ├── layout.tsx    # AdminShell guard (no flash)
│       ├── page.tsx      # Dashboard
│       ├── registration/ # Step 1
│       ├── review/       # Step 2
│       ├── rules/        # Step 3
│       ├── timetable/    # Step 4
│       ├── rooms/        # Step 5
│       ├── seating/      # Step 6
│       ├── duty/         # Step 7
│       └── reports/      # Reports
├── components/
│   ├── admin/            # AdminShell, AdminHeader, AdminTabNav, PageHeader
│   ├── auth/             # LoginForm, RoleLoginForm
│   └── ui/               # Input, Button, Card, Alert, Badge, Tabs, …
├── contexts/             # AuthContext (JWT + CSRF + session timeout)
└── lib/
    ├── api.ts            # Typed API client (axios)
    └── types.ts          # Shared TypeScript interfaces
`````

</details>

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm v9+
- **Python** 3.11+
- **Git**

> SQLite is used in development, so no PostgreSQL setup is needed locally.
> Google OCR is optional and still in development: it needs a Google Cloud project with credentials (`GOOGLE_APPLICATION_CREDENTIALS`). The rest of the app runs without it.

### 1. Clone

`````bash
git clone https://github.com/<your-username>/examguard.git
cd examguard
`````

### 2. Backend

**Windows (PowerShell)**

`````powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env   # set SECRET_KEY to any 32+ char string
python -m alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
`````

**macOS / Linux**

`````bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # set SECRET_KEY
python -m alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
`````

### 3. Frontend

`````bash
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
npm install
npm run dev
`````

### 4. Open the app

| URL | Description |
|-----|-------------|
| `http://localhost:3000/login` | Staff / HOD / Faculty / Student login |
| `http://localhost:3000/admin-login` | Admin login (hidden route) |
| `http://localhost:8000/docs` | Swagger UI |
| `http://localhost:8000/health` | Health check |

### Development credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@examguard.edu` | `admin123` |
| Staff | `staff@examguard.edu` | `staff123` |
| HOD | `hod@examguard.edu` | `hod123` |
| Faculty | `faculty@examguard.edu` | `faculty123` |
| Student | `student@examguard.edu` | `student123` |

> ⚠️ **Development only.** Change or remove all seeded credentials before any real deployment.

---

## 📡 API Reference

Full interactive docs are available at `/docs` when the backend is running. Highlights below; endpoints for unfinished steps may change.

<details>
<summary><b>Authentication</b></summary>

`````
POST  /api/auth/login            → { access_token, token_type, csrf_token? }
GET   /api/auth/me               → User (Bearer token)
POST  /api/auth/change-password
`````

</details>

<details>
<summary><b>Admin workflow</b></summary>

`````
GET   /api/admin/dashboard
GET   /api/admin/cycles
POST  /api/admin/cycles                               → auto-creates 7 WorkflowState rows
GET   /api/admin/cycles/active
PATCH /api/admin/cycles/{id}
GET   /api/admin/cycles/{id}/workflow                 → WorkflowState[7]
POST  /api/admin/cycles/{id}/workflow/{step}/confirm  → 409 if prerequisite not done
POST  /api/admin/cycles/{id}/workflow/{step}/reopen   → marks later steps STALE
`````

</details>

<details>
<summary><b>Registration (Step 1) & Review (Step 2)</b></summary>

`````
GET   /api/admin/registration/status
GET   /api/admin/registration/template
POST  /api/admin/registration/upload                  → multipart (file + department_id)
GET   /api/admin/registration/uploads/{id}/errors
GET   /api/admin/registration/uploads/{id}/errors/export
POST  /api/admin/registration/uploads/{id}/confirm

GET   /api/admin/review/summary
GET   /api/admin/review/courses                       → search, filters, paginated
PATCH /api/admin/review/courses/{id}                  → writes AuditLog
GET   /api/admin/review/clash-matrix                  → shared-student pairs (threshold = 10)
`````

</details>

<details>
<summary><b>Core resources & engines (in development)</b></summary>

`````
GET/POST/PATCH/DELETE  /api/courses | /api/students | /api/rooms | /api/rules
GET/POST/PATCH         /api/plans

POST  /api/engines/v2/engine1-scheduling/execute      → 202 + execution_id
POST  /api/engines/v2/engine2-room-seating/execute    → 202 + execution_id
POST  /api/engines/v2/engine3-invigilator/execute     → 202 + execution_id
GET   /api/engines/v2/{engine}/status/{execution_id}
`````

</details>

All `/api/admin/*` endpoints require `role = ADMIN`. Non-admin → **403**. Missing/expired token → **401**.

---

## 🔒 Security

| Measure | Implementation |
|---------|---------------|
| Authentication | JWT (HS256), 30-min expiry, IP-bound for admin sessions |
| CSRF | Token rotated on login/logout, sent on all mutating requests |
| Password hashing | bcrypt (12 rounds) |
| Rate limiting | Per-IP and per-user on login |
| Account lockout | 5 failed attempts → temporary lock |
| Input validation | Pydantic (backend) + Zod (frontend) |
| SQL injection | SQLAlchemy ORM, no raw string interpolation |
| Audit logging | Every create/update/delete recorded in `audit_logs` |
| Role enforcement | Server-side on every endpoint; frontend guards are UX only |

---

## 🗄️ Key Data Models

| Model | Purpose |
|-------|---------|
| `ExamCycle` | Scopes the workflow to one term and assessment type (ISA or ESA) |
| `WorkflowState` | 7 rows per cycle: step status and gating |
| `Department` | Code, name, HOD link |
| `User` | Email, role, department |
| `Course` | Code, name, semester, department |
| `Student` | USN, semester, enrolled courses |
| `CourseRegistrationUpload` | Per-department CSV batch with status tracking |
| `CourseRegistration` | Individual upload row with validation flags |
| `Plan` | Exam schedule container (DRAFT → APPROVED → PUBLISHED) |
| `ScheduledExam` | Course + date + session + room |
| `SeatAssignment` | Student + bench + seat code |
| `InvigilatorAssignment` | Faculty + exam + role + duty type |
| `Rule` | Solver constraints stored in DB |
| `AuditLog` | Change history with before/after values |

---

## 🧪 Tests

`````bash
# Backend
cd backend && python -m pytest tests/ -v

# Frontend type-check
cd frontend && npx tsc --noEmit

# Frontend unit tests
npm test -- --run
`````

---

## 🗺️ Roadmap

**Completed**

- [x] Login pages (admin + public role-selector)
- [x] Admin shell (header, tab nav, role guard, no flash)
- [x] Dashboard with live workflow stepper
- [x] ExamCycle model + workflow gating API
- [x] Registration page: CSV upload, validation, department status
- [x] Review page: course list, inline edit, clash matrix

**In progress / next**

- [ ] Google OCR ingestion: scanned document upload, parsing, confidence review
- [ ] Rules page: constraint toggles, modification history, presets
- [ ] Timetable page: Engine 1, drag-reschedule, conflict report

**Planned**

- [ ] ESA exam cycle support (End Semester Assessments alongside ISA)
- [ ] Rooms page: hall CRUD, availability map, confirm inventory
- [ ] Seating page: Engine 2, seat grid, fine-tune panel
- [ ] Duty page: Engine 3, allocation roster, pick-logic
- [ ] Reports page: PDF/Excel downloads, bulk export
- [ ] HOD / Faculty / Student dashboards
- [ ] Production hardening (PostgreSQL, Docker, CI)

---

## 📁 Repository Structure

`````
examguard/
├── backend/              # FastAPI application
├── frontend/             # Next.js application
├── docs/                 # Diagnostic and design documents
├── .agents/tasks/        # AI-assisted development task logs
├── AI_AGENT_CONTEXT.md   # Codebase context for AI assistants
└── SYSTEM_DESIGN.md      # High-level + low-level design
`````

---

## 🤝 Contributing

Contributions and feedback are welcome while the project is taking shape.

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. Keep migrations additive (no destructive schema changes)
3. Use the `get_current_admin_user` dependency on all admin endpoints
4. Run `npx tsc --noEmit`: zero new TypeScript errors
5. Use conventional commits: `feat(scope): description`
6. Open a Pull Request with a clear description

---

## 📄 License

Licensed under the MIT License. See [LICENSE](LICENSE).

---

<div align="center">
Built for <strong>KLE Technological University, Dr. M. S. Sheshgiri Campus</strong>
<br/>
<sub>🚧 Still building. Star the repo to follow progress.</sub>
</div>
`````
`````

I assumed Google OCR reads scanned registration sheets, since you didn't say what it's for. If it does something else (for example, reading answer scripts), tell me and I'll rewrite that section. ESA is listed as planned, so change it to 🚧 or ✅ if it's already built.
