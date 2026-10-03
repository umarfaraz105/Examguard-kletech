# ExamGuard API Documentation

This document provides an overview of the ExamGuard REST API endpoints.

## Base URL

```
http://localhost:8000/api
```

## Authentication

All API endpoints (except `/auth/login` and `/auth/register`) require JWT bearer token authentication.

### Get Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

Use the token in subsequent requests:
```http
GET /api/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login with email/password | Public |
| POST | `/token` | OAuth2 compatible login | Public |
| GET | `/me` | Get current user info | Authenticated |
| POST | `/change-password` | Change password | Authenticated |

### Users (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List all users | Admin, Exam Cell |
| GET | `/{id}` | Get user by ID | Self or Admin |
| POST | `/` | Create user | Admin |
| PATCH | `/{id}` | Update user | Self or Admin |
| DELETE | `/{id}` | Deactivate user | Admin |

### Rules (`/api/rules`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List rules (filterable) | Authenticated |
| GET | `/{id}` | Get rule by ID | Authenticated |
| POST | `/` | Create rule | Admin, Exam Cell |
| PATCH | `/{id}` | Update rule | Admin, Exam Cell |
| DELETE | `/{id}` | Delete rule | Admin |

### Courses (`/api/courses`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List courses with enrollment | Authenticated |
| GET | `/{id}` | Get course by ID | Authenticated |
| POST | `/` | Create course | Admin, Exam Cell, HOD |
| PATCH | `/{id}` | Update course | Admin, Exam Cell, HOD |
| DELETE | `/{id}` | Delete course | Admin, Exam Cell |

### Students (`/api/students`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List students | Authenticated |
| GET | `/{id}` | Get student by ID | Authenticated |
| POST | `/` | Create student | Admin, Exam Cell |
| PATCH | `/{id}` | Update student | Admin, Exam Cell |
| POST | `/{id}/enroll` | Enroll in courses | Admin, Exam Cell |
| DELETE | `/{id}` | Delete student | Admin, Exam Cell |

### Rooms (`/api/rooms`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List rooms | Authenticated |
| GET | `/{id}` | Get room with benches | Authenticated |
| POST | `/` | Create room | Admin, Exam Cell |
| PATCH | `/{id}` | Update room | Admin, Exam Cell |
| POST | `/{id}/benches` | Add bench to room | Admin, Exam Cell |
| DELETE | `/{id}` | Delete room | Admin, Exam Cell |

### Plans (`/api/plans`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List plans with stats | Authenticated |
| GET | `/{id}` | Get plan with stats | Authenticated |
| POST | `/` | Create plan | Admin, Exam Cell |
| PATCH | `/{id}` | Update plan | Admin, Exam Cell |
| POST | `/{id}/approve` | Approve plan | Admin, Exam Cell |
| POST | `/{id}/publish` | Publish plan | Admin, Exam Cell |
| DELETE | `/{id}` | Delete plan | Admin |

### Schedules (`/api/schedules`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List scheduled exams | Authenticated |
| GET | `/{id}` | Get scheduled exam | Authenticated |

### Seating (`/api/seating`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List seat assignments | Authenticated |
| GET | `/{id}` | Get seat assignment | Authenticated |

### Invigilators (`/api/invigilators`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/availability` | List faculty availability | Authenticated |
| POST | `/availability` | Set availability | Faculty (self) or Admin |
| GET | `/assignments` | List assignments | Faculty (self) or Admin |
| POST | `/assignments/{id}/confirm` | Confirm assignment | Faculty (self) or Admin |

### Engines (`/api/engines`)

All engine endpoints require Admin or Exam Cell access.

#### Engine 1: Scheduling

```http
POST /api/engines/schedule/generate
{
  "plan_id": 1,
  "course_ids": [1, 2, 3, 4, 5],
  "timeout_seconds": 60
}
```

Generates exam schedule using CP-SAT solver. Creates `ScheduledExam` records.

#### Engine 2: Room & Seating

```http
POST /api/engines/rooms/allocate
{
  "scheduled_exam_id": 1
}
```

Allocates rooms for an exam using First-Fit Decreasing algorithm.

```http
POST /api/engines/seats/allocate
{
  "scheduled_exam_id": 1
}
```

Allocates seats with branch separation. Creates `SeatAssignment` records.

#### Engine 3: Invigilator Management

```http
POST /api/engines/invigilators/assign
{
  "scheduled_exam_id": 1,
  "auto_assign": true
}
```

Assigns invigilators using workload balancing. Creates `InvigilatorAssignment` records.

#### Engine 4: Validation & Reporting

```http
POST /api/engines/validate
{
  "plan_id": 1,
  "include_details": true
}
```

Validates plan independently. Returns compliance score, grade, and issues.

```http
POST /api/engines/reports/generate
{
  "plan_id": 1,
  "report_type": "compliance",
  "format": "pdf"
}
```

Generates reports in PDF, Excel, or JSON format.

Report types: `compliance`, `schedule`, `seating`, `invigilator`
Formats: `pdf`, `excel`, `json`

```http
POST /api/engines/dashboard
{
  "plan_id": 1
}
```

Returns conflict dashboard data with overview, groupings, hot spots, and timeline.

## Workflow Example

Complete workflow to create and validate an exam plan:

```bash
# 1. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'

# Save token from response
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# 2. Create exam plan
curl -X POST http://localhost:8000/api/plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ISA-1 December 2024",
    "exam_type": "ISA1",
    "academic_year": "2024-25",
    "start_date": "2024-12-01",
    "end_date": "2024-12-10"
  }'

# 3. Generate schedule (Engine 1)
curl -X POST http://localhost:8000/api/engines/schedule/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": 1,
    "course_ids": [1, 2, 3, 4, 5],
    "timeout_seconds": 60
  }'

# 4. Allocate rooms (Engine 2)
curl -X POST http://localhost:8000/api/engines/rooms/allocate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scheduled_exam_id": 1}'

# 5. Allocate seats (Engine 2)
curl -X POST http://localhost:8000/api/engines/seats/allocate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"scheduled_exam_id": 1}'

# 6. Assign invigilators (Engine 3)
curl -X POST http://localhost:8000/api/engines/invigilators/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scheduled_exam_id": 1,
    "auto_assign": true
  }'

# 7. Validate plan (Engine 4)
curl -X POST http://localhost:8000/api/engines/validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": 1,
    "include_details": true
  }'

# 8. Generate compliance report (Engine 4)
curl -X POST http://localhost:8000/api/engines/reports/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": 1,
    "report_type": "compliance",
    "format": "pdf"
  }'

# 9. Approve and publish
curl -X POST http://localhost:8000/api/plans/1/approve \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:8000/api/plans/1/publish \
  -H "Authorization: Bearer $TOKEN"
```

## Error Responses

All endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "detail": "Error message describing what went wrong"
}
```

## Interactive API Documentation

FastAPI provides interactive API documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
