import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-surface2 rounded-2xl border border-border2 m-4">
          <div className="w-16 h-16 bg-warn/10 text-warn rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-ink mb-2 font-serif">Something went wrong</h2>
          <p className="text-ink3 max-w-md mb-8">
            {this.state.error?.message || "An unexpected error occurred in the application interface."}
          </p>
          <Button 
            variant="primary" 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw size={18} /> Reload Application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
