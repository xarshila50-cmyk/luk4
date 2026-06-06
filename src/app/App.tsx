import { RouterProvider } from 'react-router-dom';

import { ErrorBoundary } from '@/shared/components/error-boundary';
import { AppProviders } from './providers';
import { router } from './router';

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  );
}
