import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRestart = () => {
    window.location.reload();
  };

  handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-error-500" aria-hidden="true" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              
              <p className="text-gray-600 mb-6 max-w-md">
                We apologize for the inconvenience. An unexpected error has occurred in the application.
                Please try restarting the application or return to the dashboard.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={this.handleRestart}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 min-h-[44px]"
                  aria-label="Restart application"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Restart Application
                </button>
                
                <button
                  onClick={this.handleGoToDashboard}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 min-h-[44px]"
                  aria-label="Go to dashboard"
                >
                  <Home className="w-4 h-4" aria-hidden="true" />
                  Go to Dashboard
                </button>
              </div>

              {isDevelopment && this.state.error && (
                <details className="w-full text-left bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <summary className="cursor-pointer font-semibold text-gray-900 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="space-y-4 mt-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Error Message:</h3>
                      <pre className="text-sm text-error-600 bg-error-50 p-3 rounded overflow-x-auto">
                        {this.state.error.message}
                      </pre>
                    </div>
                    
                    {this.state.error.stack && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Stack Trace:</h3>
                        <pre className="text-xs text-gray-700 bg-white p-3 rounded border border-gray-200 overflow-x-auto max-h-64">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {this.state.errorInfo && this.state.errorInfo.componentStack && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Component Stack:</h3>
                        <pre className="text-xs text-gray-700 bg-white p-3 rounded border border-gray-200 overflow-x-auto max-h-64">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
