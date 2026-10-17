import { renderWithProviders, screen } from '@/test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import ErrorFallback from '../ErrorFallback';

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message');

  describe('page variant', () => {
    it('should render error message', () => {
      renderWithProviders(
        <ErrorFallback error={mockError} variant="page" />
      );
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should show error details in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      renderWithProviders(
        <ErrorFallback error={mockError} variant="page" />
      );
      expect(screen.getByText('Test error message')).toBeInTheDocument();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should render retry button when onRetry provided', () => {
      const onRetry = jest.fn();
      renderWithProviders(
        <ErrorFallback error={mockError} variant="page" onRetry={onRetry} />
      );
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should call onRetry when retry button clicked', async () => {
      const onRetry = jest.fn();
      const user = userEvent.setup();
      
      renderWithProviders(
        <ErrorFallback error={mockError} variant="page" onRetry={onRetry} />
      );
      
      await user.click(screen.getByRole('button', { name: /try again/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should render go home button when onGoHome provided', () => {
      const onGoHome = jest.fn();
      renderWithProviders(
        <ErrorFallback error={mockError} variant="page" onGoHome={onGoHome} />
      );
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    });

    it('should call onGoHome when go home button clicked', async () => {
      const onGoHome = jest.fn();
      const user = userEvent.setup();
      
      renderWithProviders(
        <ErrorFallback error={mockError} variant="page" onGoHome={onGoHome} />
      );
      
      await user.click(screen.getByRole('button', { name: /go home/i }));
      expect(onGoHome).toHaveBeenCalledTimes(1);
    });
  });

  describe('route variant', () => {
    it('should render with route-specific styling', () => {
      renderWithProviders(
        <ErrorFallback error={mockError} variant="route" />
      );
      expect(screen.getByText('Page Error')).toBeInTheDocument();
    });

    it('should show go back button', () => {
      renderWithProviders(
        <ErrorFallback error={mockError} variant="route" />
      );
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });
  });

  describe('component variant', () => {
    it('should render compact inline fallback', () => {
      renderWithProviders(
        <ErrorFallback error={mockError} variant="component" />
      );
      expect(screen.getByText('Component error')).toBeInTheDocument();
    });

    it('should show custom error message', () => {
      renderWithProviders(
        <ErrorFallback 
          error={mockError} 
          variant="component" 
          errorMessage="Custom error" 
        />
      );
      expect(screen.getByText('Custom error')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      const onRetry = jest.fn();
      renderWithProviders(
        <ErrorFallback error={mockError} variant="page" onRetry={onRetry} />
      );
      expect(screen.getByLabelText('Retry')).toBeInTheDocument();
    });
  });
});
