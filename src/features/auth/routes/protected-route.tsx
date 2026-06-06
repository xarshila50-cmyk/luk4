import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAdminStatus } from '@/features/admin/hooks/use-admin-status';
import { useAuth } from '@/features/auth/context/use-auth';
import { LoadingState } from '@/shared/components/loading-state';
import { useI18n } from '@/shared/i18n/i18n';

type ProtectedRouteProps = {
  children: ReactNode;
  requireAdmin?: boolean;
};

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const adminStatus = useAdminStatus();
  const location = useLocation();
  const { localizedPath, t } = useI18n();

  if (isLoading || (requireAdmin && adminStatus.isLoading)) {
    return (
      <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <LoadingState
          title={t('Checking session')}
          description={t('Please wait while Gaachuqe loads your account.')}
          variant="session"
        />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        state={{ from: location.pathname }}
        to={localizedPath('/login')}
      />
    );
  }

  if (requireAdmin && !adminStatus.data) {
    return <Navigate replace to={localizedPath('/')} />;
  }

  return children;
}
