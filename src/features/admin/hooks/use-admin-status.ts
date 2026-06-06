import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/context/use-auth';

import { fetchAdminStatus } from '../api/admin-api';

export function useAdminStatus() {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['admin-status', user?.id],
    queryFn: () => fetchAdminStatus(user?.id),
    enabled: isAuthenticated && Boolean(user?.id),
    staleTime: 60_000,
  });
}
