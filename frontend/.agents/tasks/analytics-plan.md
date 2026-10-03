# Implementation Plan: Data Visualization Components and Analytics Dashboard

## Project Analysis Summary

After investigating the ExamGuard frontend codebase, I found:

- **Next.js 14 app router** structure with role-based route groups under `/dashboard`
- **KLE theme system** with primary red (#C8102E) and comprehensive semantic colors
- **Existing API client** with endpoints for schedules, rooms, invigilators, students, engines
- **Layout patterns** using Card components and grid layouts
- **No recharts dependency** currently installed
- **Role-based navigation** in Sidebar.tsx with dynamic menu visibility

## Implementation Plan

### Prerequisites
- [ ] 1. **Install Chart Dependencies**
      - Install recharts ^2.12.0 (ships with its own TypeScript types)
      - Files: package.json, package-lock.json
      - Verify: `npm list recharts` shows version 2.12.0

### Core Chart Infrastructure
- [ ] 2. **Create Chart Components Directory Structure**
      - Create src/components/charts/ directory with index.ts barrel export
      - Files: src/components/charts/index.ts
      - Verify: Directory exists and index.ts exports empty object

- [ ] 3. **Build Base Chart Wrapper Component**
      - Create src/components/charts/ChartWrapper.tsx with loading states, error boundaries, accessibility
      - Includes role="img", aria-label support, consistent KLE theme colors
      - Files: src/components/charts/ChartWrapper.tsx
      - Verify: `npm run type-check` passes without errors

- [ ] 4. **Build Individual Chart Components**
      - Create LineChart.tsx, BarChart.tsx, PieChart.tsx, AreaChart.tsx, DonutChart.tsx wrappers
      - Each uses KLE theme colors: primary (#C8102E), success (#10B981), info (#3B82F6), warning (#F59E0B)
      - Files: src/components/charts/LineChart.tsx, src/components/charts/BarChart.tsx, src/components/charts/PieChart.tsx, src/components/charts/AreaChart.tsx, src/components/charts/DonutChart.tsx
      - Verify: `npm run type-check` passes, charts render with mock data

- [ ] 5. **Create Chart Loading Skeletons**
      - Build LoadingSkeleton.tsx with Tailwind pulse animation matching chart dimensions
      - Files: src/components/charts/LoadingSkeleton.tsx
      - Verify: Skeleton animates and matches chart container sizes

### Date Range and Controls
- [ ] 6. **Build Date Range Picker Component**
      - Create DateRangePicker.tsx using existing form patterns from src/components/forms/
      - Uses date-fns library (already installed) for date handling
      - Files: src/components/charts/DateRangePicker.tsx
      - Verify: Component renders, emits onChange events with proper date objects

- [ ] 7. **Create Chart Export Utility**
      - Build ExportButton.tsx with canvas-based PNG download functionality
      - Uses html2canvas approach to export chart area
      - Files: src/components/charts/ExportButton.tsx
      - Verify: Export button downloads PNG file of chart area

### Analytics Utilities and Data Layer
- [ ] 8. **Build Analytics Data Utilities**
      - Create src/lib/analytics.ts with data transformation helpers and mock generators
      - Includes functions: transformScheduleData, transformRoomUtilization, transformEngineHealth, generateMockData
      - Files: src/lib/analytics.ts
      - Verify: `npm run type-check` passes, mock data functions return proper chart data format

- [ ] 9. **Create Real-time Data Hook**
      - Build useAnalyticsData.ts hook that polls API every 30s using existing api.ts client
      - Implements caching, error handling, and loading states
      - Files: src/lib/hooks/useAnalyticsData.ts
      - Verify: Hook fetches data, updates every 30s, handles errors gracefully

### Analytics Pages Implementation
- [ ] 10. **Build Admin Analytics Page**
       - Create src/app/admin/analytics/page.tsx with system-wide metrics
       - Charts: Exam stats over time, Room utilization heatmap, Engine health status, User activity
       - Layout: Responsive grid using Tailwind, matches existing admin dashboard pattern
       - Files: src/app/admin/analytics/page.tsx
       - Verify: `npm run dev` shows page at /admin/analytics, charts render with data

- [ ] 11. **Build Faculty Analytics Page**
       - Create src/app/faculty/analytics/page.tsx with department/course metrics
       - Charts: Course registrations trend, Exam schedule distribution, Invigilator assignments
       - Filters: Department, Date range, Course type
       - Files: src/app/faculty/analytics/page.tsx
       - Verify: Page accessible at /faculty/analytics, filters work correctly

- [ ] 12. **Build Student Analytics Page**
       - Create src/app/dashboard/analytics/page.tsx with personal metrics
       - Charts: Registered courses breakdown, Upcoming exams timeline, Grade trends (if available)
       - Personal dashboard style matching existing student dashboard
       - Files: src/app/dashboard/analytics/page.tsx
       - Verify: Page accessible at /dashboard/analytics, shows student-specific data

### Navigation Integration
- [ ] 13. **Add Analytics Navigation Links**
       - Update src/components/layout/Sidebar.tsx to include analytics links for each role
       - Admin: "System Analytics", Faculty: "Department Analytics", Student: "My Analytics"
       - Uses BarChart3 icon from lucide-react (already installed)
       - Files: src/components/layout/Sidebar.tsx
       - Verify: Navigation links appear for correct roles, navigate to analytics pages

### Data Integration and Polish
- [ ] 14. **Connect Real API Endpoints**
       - Update analytics utilities to use actual API data from src/lib/api.ts
       - Implement data transformation for schedules, rooms, invigilators APIs
       - Fallback to mock data when API unavailable
       - Files: src/lib/analytics.ts, src/lib/hooks/useAnalyticsData.ts
       - Verify: Charts show real data when backend available, mock data when offline

- [ ] 15. **Implement Responsive Design**
       - Ensure all charts are responsive using Recharts ResponsiveContainer
       - Mobile-first breakpoints: charts stack vertically on mobile, grid on desktop
       - Touch-friendly controls and interactions
       - Files: All analytics page files, chart component files
       - Verify: `npm run dev` and test on mobile viewport, charts resize properly

- [ ] 16. **Add Error Boundaries and Loading States**
       - Wrap chart components in error boundaries with fallback UI
       - Implement skeleton loading states during data fetch
       - Add empty state illustrations when no data available
       - Files: src/components/charts/ChartErrorBoundary.tsx, update all analytics pages
       - Verify: Error states show gracefully, loading states appear during fetch

### Final Testing and Verification
- [ ] 17. **End-to-End Testing**
       - Test all analytics pages in different roles (admin, faculty, student)
       - Verify chart interactions: hover, click, export, date range selection
       - Test responsive behavior across breakpoints
       - Files: All implemented files
       - Verify: `npm run build` succeeds, all pages load without errors, interactions work

- [ ] 18. **Performance Optimization**
       - Lazy load chart components using React.lazy and Suspense
       - Implement data memoization for expensive calculations
       - Add proper cache headers for analytics API calls
       - Files: Update analytics pages and components
       - Verify: Page load times under 2s, chart renders under 500ms

## Technical Specifications

### Chart Color Palette
```javascript
const KLE_CHART_COLORS = {
  primary: '#C8102E',    // KLE Red
  success: '#10B981',    // Green
  info: '#3B82F6',       // Blue
  warning: '#F59E0B',    // Amber
  secondary: '#6B7280',  // Gray
}
```

### API Integration Points
- `/api/schedules` - Exam scheduling data
- `/api/rooms` - Room utilization metrics
- `/api/invigilators` - Assignment and availability data
- `/api/students` - Enrollment and registration stats
- `/api/engines/dashboard` - System health metrics

### File Structure
```
src/
├── components/
│   └── charts/
│       ├── index.ts
│       ├── ChartWrapper.tsx
│       ├── LineChart.tsx
│       ├── BarChart.tsx
│       ├── PieChart.tsx
│       ├── AreaChart.tsx
│       ├── DonutChart.tsx
│       ├── LoadingSkeleton.tsx
│       ├── DateRangePicker.tsx
│       ├── ExportButton.tsx
│       └── ChartErrorBoundary.tsx
├── lib/
│   ├── analytics.ts
│   └── hooks/
│       └── useAnalyticsData.ts
└── app/
    ├── admin/
    │   └── analytics/
    │       └── page.tsx
    ├── faculty/
    │   └── analytics/
    │       └── page.tsx
    └── dashboard/
        └── analytics/
            └── page.tsx
```

### Dependencies to Install
```json
{
  "dependencies": {
    "recharts": "^2.12.0"
  }
}
```

### Verification Commands
- Build: `npm run build`
- Type Check: `npm run type-check`
- Development: `npm run dev`
- Lint: `npm run lint`

This plan creates a comprehensive analytics system that integrates seamlessly with the existing ExamGuard architecture, follows established patterns, and provides valuable insights across all user roles.