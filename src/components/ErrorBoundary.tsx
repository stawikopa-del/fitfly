import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState(prev => ({ 
      errorInfo, 
      errorCount: prev.errorCount + 1 
    }));

    // Auto-reset after 10 seconds if user doesn't interact
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    this.resetTimeoutId = setTimeout(() => {
      this.handleReset();
    }, 10000);
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  handleReset = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      try {
        // Clear session storage to prevent infinite error loops
        sessionStorage.clear();
      } catch {
        // Ignore storage errors
      }
      window.location.reload();
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorCount: 0 });
    if (typeof window !== 'undefined') {
      try {
        // Clear session storage
        sessionStorage.clear();
      } catch {
        // Ignore storage errors
      }
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // If too many errors, force reload
      if (this.state.errorCount > 3) {
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            try {
              sessionStorage.clear();
            } catch {
              // Ignore
            }
            window.location.href = '/';
          }, 100);
        }
        return null;
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
          <div className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full text-center shadow-lg">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Coś poszło nie tak
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę lub wrócić do strony głównej.
            </p>
            
            <div className="space-y-2">
              <Button onClick={this.handleReset} variant="outline" className="w-full rounded-2xl">
                <RefreshCw className="w-4 h-4 mr-2" />
                Spróbuj ponownie
              </Button>
              
              <Button onClick={this.handleGoHome} className="w-full rounded-2xl">
                <Home className="w-4 h-4 mr-2" />
                Strona główna
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer">
                  Szczegóły błędu (dev)
                </summary>
                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component for catching async errors in hooks
export function SafeComponent({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}