import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--spacing-xl)',
                    background: 'var(--clay-bg)'
                }}>
                    <div style={{
                        textAlign: 'center',
                        maxWidth: '400px'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto var(--spacing-lg)',
                            background: 'rgba(220, 38, 38, 0.1)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <AlertTriangle size={36} color="#DC2626" />
                        </div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            marginBottom: 'var(--spacing-md)',
                            color: 'var(--clay-foreground)'
                        }}>
                            Something went wrong
                        </h2>
                        <p style={{
                            color: 'var(--clay-muted)',
                            marginBottom: 'var(--spacing-lg)'
                        }}>
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={this.handleRetry}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                padding: '12px 24px',
                                background: 'var(--clay-accent)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-lg)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            <RefreshCw size={18} />
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}