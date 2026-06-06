import { supabase } from '@/shared/lib/supabase';

export async function fetchUnreadReservationNotificationCount(userId?: string) {
  if (!userId) {
    return 0;
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('type', 'reservation_requested')
    .is('read_at', null);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function markReservationNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', userId)
    .eq('type', 'reservation_requested')
    .is('read_at', null);

  if (error) {
    throw new Error(error.message);
  }
}
