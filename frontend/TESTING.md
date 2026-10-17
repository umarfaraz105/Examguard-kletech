# ExamGuard Frontend Testing Guide

## Test Stack

- **Unit & Integration Tests**: Jest 29 + React Testing Library 14
- **E2E Tests**: Playwright 1.41
- **API Mocking**: MSW (Mock Service Worker) v2
- **Environment**: jsdom for browser environment

## Running Tests

### Unit Tests
```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:unit         # Unit tests only
npm run test:coverage     # With coverage report
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e          # Headless mode
npm run test:e2e:headed   # With browser
npm run test:e2e:ui       # Interactive UI
npm run test:e2e:debug    # Debug mode
```

### All Tests
```bash
npm run test:all
```

## Test Structure

```
frontend/
├── src/
│   ├── __tests__/
│   │   └── integration/        # Integration tests
│   ├── lib/
│   │   └── __tests__/          # Unit tests for lib
│   ├── hooks/
│   │   └── __tests__/          # Hook tests
│   ├── components/
│   │   └── **/__tests__/       # Component tests
│   └── test-utils/             # Test utilities
│       ├── test-utils.tsx      # renderWithProviders
│       ├── mock-data.ts        # Mock fixtures
│       ├── msw-handlers.ts     # API mock handlers
│       └── msw-server.ts       # MSW server setup
├── e2e/                        # E2E tests
├── jest.config.js
├── jest.setup.js
└── playwright.config.ts
```

## Coverage Targets

- Overall: 70%+ statements/lines/functions, 60%+ branches
- Critical files (api.ts, error-handler.ts, validations.ts): 80-90%+
- Components: 60%+
- Hooks: 80%+

## Writing Tests

### Unit Test Example
```typescript
import { renderHook } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

test('should debounce value', () => {
  const { result, rerender } = renderHook(
    ({ value }) => useDebounce(value, 300),
    { initialProps: { value: 'initial' } }
  );
  
  expect(result.current).toBe('initial');
});
```

### Integration Test Example
```typescript
import { renderWithProviders, screen, waitFor } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';

test('should login successfully', async () => {
  const user = userEvent.setup();
  renderWithProviders(<LoginForm />);
  
  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.type(screen.getByLabelText('Password'), 'password');
  await user.click(screen.getByRole('button', { name: /login/i }));
  
  await waitFor(() => {
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });
});
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test';

test('should navigate to dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  
  await page.waitForURL('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

## Mocking

### API Mocking
MSW handlers defined in `src/test-utils/msw-handlers.ts`. Override in tests:

```typescript
import { server } from '@/test-utils/msw-server';
import { http, HttpResponse } from 'msw';

test('should handle error', async () => {
  server.use(
    http.get('/api/users', () => {
      return HttpResponse.json({ detail: 'Error' }, { status: 500 });
    })
  );
  
  // ... test error handling
});
```

### Next.js Mocking
Router mocked in `jest.setup.js`. LocalStorage, window.matchMedia, IntersectionObserver also mocked.

## CI Integration

Add to CI pipeline:
```yaml
- run: npm run test:coverage
- run: npm run test:e2e
```

## Troubleshooting

- **Tests timing out**: Increase Jest timeout in test file: `jest.setTimeout(10000)`
- **MSW not intercepting**: Check handlers are properly registered in msw-server.ts
- **Playwright can't find elements**: Use `await page.pause()` to debug
- **Coverage too low**: Check if files are excluded in jest.config.js

## Test Files Created

### Unit Tests
- `src/hooks/__tests__/useDebounce.test.ts` - Debounce hook tests
- `src/lib/__tests__/error-handler.test.ts` - Error handler tests
- `src/lib/__tests__/validations.test.ts` - Zod schema validation tests
- `src/lib/__tests__/api.test.ts` - API client tests
- `src/lib/__tests__/export-utils.test.ts` - Export utilities tests
- `src/lib/hooks/__tests__/useTableData.test.ts` - Table data hook tests
- `src/components/ui/__tests__/Button.test.tsx` - Button component tests
- `src/components/errors/__tests__/ErrorFallback.test.tsx` - Error fallback tests

### Integration Tests
- `src/__tests__/integration/auth.test.tsx` - Authentication flow tests

### E2E Tests
- `e2e/auth-flow.spec.ts` - Authentication E2E tests (placeholder)

## Notes

- E2E tests require the Next.js dev server running (`npm run dev`)
- E2E tests may require backend API server for full functionality
- Some E2E tests are marked with `test.skip()` and require backend setup
- Run `npx playwright install` before first E2E test run to install browsers
