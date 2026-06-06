import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/context/use-auth';

import { fetchUnreadReservationNotificationCount } from '../api/notifications-api';

export function useUnreadReservationNotifications() {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: ['unread-reservation-notifications', user?.id],
    queryFn: () => fetchUnreadReservationNotificationCount(user?.id),
    enabled: isAuthenticated && Boolean(user?.id),
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}
