import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — catches render/runtime errors from descendants.
 * Wrapped around the Phaser canvas so a scene crash doesn't blank the
 * whole React app — the HUD and menu remain usable to restart.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        role="alert"
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/90 p-6 text-center text-foreground"
      >
        <h2 className="text-xl font-bold text-destructive">Scene crashed</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {this.state.error?.message ?? 'An unexpected error occurred while rendering the game.'}
        </p>
        <button
          onClick={this.reset}
          className="rounded-md border border-primary px-4 py-2 text-primary hover:bg-primary/10"
        >
          Retry
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
