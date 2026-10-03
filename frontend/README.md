# ExamGuard Frontend

Modern Next.js frontend for the ExamGuard Examination Management System.

## Features

- **Authentication**: JWT-based login with role-based access control
- **Dashboard**: Overview of plans, courses, students, and rooms
- **Exam Plan Management**: Create, view, and manage examination plans
- **Engine Integration**: Execute all 4 engines from the UI
  - Engine 1: Schedule Generation with CP-SAT
  - Engine 2: Room & Seat Allocation
  - Engine 3: Invigilator Assignment
  - Engine 4: Validation & Reporting
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live feedback from backend operations

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Components**: Custom components with Tailwind

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── dashboard/          # Main dashboard
│   │   ├── login/              # Authentication
│   │   ├── plans/              # Exam plan management
│   │   │   ├── [id]/           # Plan detail view
│   │   │   └── new/            # Create new plan
│   │   ├── layout.tsx          # Root layout with AuthProvider
│   │   └── page.tsx            # Home page (redirects)
│   ├── components/             # Reusable components
│   │   ├── layout/             # Layout components
│   │   │   └── Navbar.tsx      # Navigation bar
│   │   └── ui/                 # UI components
│   │       ├── Button.tsx      # Button component
│   │       ├── Card.tsx        # Card container
│   │       └── Input.tsx       # Input field
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx    # Authentication context
│   └── lib/                    # Utilities
│       └── api.ts              # API client with all endpoints
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:8000

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Update .env.local with your backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development

```bash
# Run development server
npm run dev

# Open browser to http://localhost:3000
```

### Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

## User Roles

The system supports 4 user roles with different permissions:

1. **ADMIN**: Full system access
2. **EXAM_CELL**: Manage plans, schedules, and operations
3. **HOD**: View and manage department data
4. **FACULTY**: View assignments and confirm invigilator duties

## Demo Credentials

```
Email: admin@kletu.ac.in
Password: admin123
```

## Key Features

### Authentication

- Secure JWT-based authentication
- Automatic token refresh
- Role-based route protection
- Persistent sessions with localStorage

### Dashboard

- Real-time statistics
- Quick action shortcuts
- Recent plans overview
- System status indicators

### Exam Plan Workflow

1. **Create Plan**: Define exam type, dates, and details
2. **Generate Schedule**: Select courses and run Engine 1
3. **Allocate Rooms**: Assign rooms with Engine 2
4. **Allocate Seats**: Create seating arrangements with branch separation
5. **Assign Invigilators**: Auto-assign faculty with workload balancing
6. **Validate**: Check compliance and get quality score
7. **Approve**: Review and approve the plan
8. **Publish**: Make the plan live

### Plan Management

- List all plans with filtering
- View detailed plan information
- Execute engine operations
- Track progress with statistics
- Workflow status management

## API Integration

All API calls are centralized in `src/lib/api.ts`:

```typescript
// Example: Fetch all plans
const response = await plansAPI.list();
const plans = response.data;

// Example: Generate schedule
await enginesAPI.generateSchedule({
  plan_id: 1,
  course_ids: [1, 2, 3],
  timeout_seconds: 60
});

// Example: Validate plan
const validation = await enginesAPI.validatePlan(planId);
console.log(validation.data.compliance_score);
```

## Component Usage

### Button

```tsx
<Button 
  variant="primary"    // primary, secondary, danger, success
  size="md"           // sm, md, lg
  loading={false}     // Show loading spinner
  onClick={handleClick}
>
  Click Me
</Button>
```

### Input

```tsx
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```

### Card

```tsx
<Card title="Statistics">
  <p>Content goes here</p>
</Card>
```

## Styling with Tailwind

The project uses Tailwind CSS for styling:

```tsx
<div className="bg-blue-600 text-white p-4 rounded-lg shadow-md">
  <h2 className="text-2xl font-bold">Hello</h2>
</div>
```

## Error Handling

API errors are handled automatically:

- 401 Unauthorized → Redirect to login
- 403 Forbidden → Show permission error
- 500 Server Error → Display error message

## Future Enhancements

- [ ] Course management pages
- [ ] Student management pages
- [ ] Room configuration UI
- [ ] Rule editor
- [ ] User management
- [ ] Reports viewer
- [ ] Dashboard visualizations (charts)
- [ ] Real-time notifications
- [ ] Export functionality
- [ ] Dark mode support

## Troubleshooting

### API Connection Issues

If you can't connect to the backend:

1. Verify backend is running: `http://localhost:8000/docs`
2. Check NEXT_PUBLIC_API_URL in .env.local
3. Check browser console for CORS errors

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Type Errors

```bash
# Regenerate TypeScript types
npm run type-check
```

## Contributing

When adding new features:

1. Create component in appropriate directory
2. Add API endpoint to `lib/api.ts`
3. Update this README with new features
4. Test on multiple screen sizes

## License

Part of the ExamGuard examination management system.
