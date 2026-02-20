import React, { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          textAlign: 'center',
          padding: '2rem',
          gap: 12,
          fontFamily: 'DM Sans, sans-serif',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'rgba(244,63,94,0.12)',
            border: '1px solid rgba(244,63,94,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, marginBottom: 8,
          }}>
            ⚠
          </div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, margin: 0 }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: 14 }}>
            Please refresh the page or try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: '9px 20px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontFamily: 'DM Sans, sans-serif',
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;