import React from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 md:p-6 lg:p-10 min-h-screen flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center p-12 glass-card rounded-[2rem] border border-red-500/10 bg-red-500/5 max-w-lg text-center shadow-2xl">
                        <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
                            <AlertCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Something went wrong</h2>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            A critical error occurred while rendering this interface. Please try refreshing the page or contact support if the issue persists.
                        </p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-red-500/30 active:scale-95"
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

export function withErrorBoundary(Component) {
    return function ErrorBoundaryWrapper(props) {
        return (
            <ErrorBoundary>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}

export default ErrorBoundary;
