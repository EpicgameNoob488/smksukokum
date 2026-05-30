import React, { Component, ErrorInfo, ReactNode } from 'react';
import { tokens, DT } from '../lib/designTokens';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: tokens.colors.mainBg }}>
          <div className={`${DT.radius.xl} ${DT.shadow.xl} p-8 max-w-md text-center`} style={{ backgroundColor: tokens.colors.cardInnerBg }}>
            <div className={`w-16 h-16 ${DT.radius.full} bg-red-100 flex items-center justify-center mx-auto mb-4`}>
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: tokens.colors.textNavy }}>Something went wrong</h2>
            <p className="mb-4" style={{ color: tokens.colors.textMuted }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className={`text-left mb-4 text-xs text-red-500 bg-red-50 p-3 ${DT.radius.sm}`}>
                <summary className="cursor-pointer font-medium">Error details</summary>
                <pre className="mt-2 whitespace-pre-wrap break-words">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReset}
              className={`px-6 py-3 text-white ${DT.radius.md} font-bold hover:bg-red-600 transition-colors`}
              style={{ backgroundColor: tokens.colors.primaryRed }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
