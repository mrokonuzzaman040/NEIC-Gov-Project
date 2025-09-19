'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // You can log the error to an error reporting service here
    if (typeof window !== 'undefined') {
      // Only log in browser, not during SSR
      console.error('Error boundary triggered:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  public render() {
    if (this.state.hasError) {
      // Render custom fallback UI or use provided fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-700 dark:text-red-400 text-sm">
            A component error occurred. Please refresh the page or try again.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-red-600 dark:text-red-500 text-xs">
                Error details (development mode)
              </summary>
              <pre className="mt-2 text-xs text-red-600 dark:text-red-500 whitespace-pre-wrap">
                {this.state.error.message}
                {this.state.error.stack && `\n${this.state.error.stack}`}
              </pre>
            </details>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;