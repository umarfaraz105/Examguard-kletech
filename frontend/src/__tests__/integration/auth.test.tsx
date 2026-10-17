/**
 * @jest-environment jsdom
 */
import { renderWithProviders, screen, waitFor } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import { useAuth } from '@/contexts/AuthContext';
// Import MSW directly in test files that need it
import '@/test-utils/msw-server';
import { server } from '@/test-utils/msw-server';
import { http, HttpResponse } from 'msw';

// Test component that uses auth
function TestAuthComponent() {
  const { user, isAuthenticated, login, logout, hasRole } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
      </div>
      <div data-testid="user-name">{user?.full_name || 'No user'}</div>
      <div data-testid="user-role">{user?.role || 'No role'}</div>
      <div data-testid="has-admin-role">
        {hasRole('admin') ? 'Is admin' : 'Not admin'}
      </div>
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('Authentication Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should start unauthenticated', () => {
    renderWithProviders(<TestAuthComponent />);
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
  });

  it('should login successfully and store token', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestAuthComponent />);

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    }, { timeout: 3000 });

    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should check user roles correctly', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestAuthComponent />);

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('has-admin-role')).toHaveTextContent('Is admin');
    }, { timeout: 3000 });
  });

  it('should logout and clear token', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestAuthComponent />);

    await user.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    }, { timeout: 3000 });

    await user.click(screen.getByText('Logout'));

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    expect(localStorage.removeItem).toHaveBeenCalled();
  });

  it('should handle login failure', async () => {
    server.use(
      http.post('http://localhost:8000/api/auth/login', () => {
        return HttpResponse.json(
          { detail: 'Invalid credentials' },
          { status: 401 }
        );
      })
    );

    const user = userEvent.setup();
    renderWithProviders(<TestAuthComponent />);

    await user.click(screen.getByText('Login'));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    });
  });
});
