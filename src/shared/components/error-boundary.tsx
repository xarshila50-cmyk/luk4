import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

import { captureException } from '@/shared/lib/observability';

import { Button } from './ui/button';

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    captureException(error, {
      componentStack: errorInfo.componentStack,
      source: 'error-boundary',
    });
  }

  render() {
    if (this.state.error) {
      return (
        <main className="flex min-h-svh items-center justify-center px-4">
          <div className="bg-card w-full max-w-md rounded-lg border p-5 shadow-sm">
            <p className="text-destructive text-sm font-medium">
              Something went wrong
            </p>
            <h1 className="mt-2 text-2xl font-semibold">
              Gaachuqe could not load
            </h1>
            <p className="text-muted-foreground mt-3 text-sm">
              Refresh the page and try again. If the issue continues, please
              return later.
            </p>
            <Button
              className="mt-5"
              type="button"
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
