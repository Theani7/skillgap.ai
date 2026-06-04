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
                <div className="min-h-screen flex items-center justify-center p-12 bg-secondary">
                    <div className="text-center max-w-[400px]">
                        <div className="w-20 h-20 mx-auto mb-6 bg-error-50 rounded-full flex items-center justify-center">
                            <AlertTriangle size={36} className="text-error-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-4 text-primary">
                            Something went wrong
                        </h2>
                        <p className="text-secondary mb-8">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <button
                            onClick={this.handleRetry}
                            className="btn btn-primary shadow-md inline-flex items-center gap-2"
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