import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Store error info in state
    this.setState({
      error,
      errorInfo
    });

    // Track error with analytics
    try {
      const { analyticsService } = await import('../services/analyticsService');
      analyticsService.trackError(error, 'error_boundary');
    } catch (importError) {
      console.error('Failed to import analytics service:', importError);
    }

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided as prop
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-shrink-0">
                <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Oops! Something went wrong</h1>
                <p className="text-gray-400 mt-1">We encountered an unexpected error</p>
              </div>
            </div>

            {this.state.error && (
              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-red-400 mb-2">Error Details:</h3>
                <p className="text-sm text-gray-300 font-mono break-all">
                  {this.state.error.toString()}
                </p>
                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                  <details className="mt-4">
                    <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                      Stack Trace (Development Only)
                    </summary>
                    <pre className="text-xs text-gray-400 mt-2 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/80 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Go Home
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-900 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">What you can do:</h3>
              <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                <li>Try refreshing the page</li>
                <li>Check your internet connection</li>
                <li>Clear your browser cache and cookies</li>
                <li>Make sure the backend server is running (port 3001)</li>
                <li>If the problem persists, please report this issue</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
