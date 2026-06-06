import { supabase } from '@/shared/lib/supabase';

import type { FeedCategory, FeedStatus } from '@/features/feed/types/feed';
import { normalizeGeorgianPhoneNumber } from '@/features/auth/utils/georgian-phone-number';

export type ProfilePost = {
  id: string;
  title: string;
  location: string;
  category: FeedCategory;
  status: FeedStatus | 'archived';
  createdAt: string;
  expiresAt: string;
  reservationCount: number;
};

export type ReservedItem = {
  id: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';
  expiresAt: string | null;
  createdAt: string;
  post: {
    id: string;
    title: string;
    location: string;
    status: FeedStatus | 'archived';
  } | null;
};

export type ProfileSummary = {
  displayName: string;
  location: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
};

type ProfilePostRow = {
  id: string;
  title: string;
  location: string;
  category: FeedCategory;
  status: FeedStatus | 'archived';
  created_at: string;
  expires_at: string;
  reservations: Array<{ id: string }> | null;
};

type ReservedItemRow = {
  id: string;
  status: ReservedItem['status'];
  expires_at: string | null;
  created_at: string;
  posts: ReservedItem['post'];
};

export async function fetchProfileSummary(
  userId: string,
): Promise<ProfileSummary> {
  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, location, avatar_url, phone_number')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    displayName: data.display_name,
    location: data.location,
    avatarUrl: data.avatar_url,
    phoneNumber: data.phone_number,
  };
}

export async function fetchMyPosts(userId: string): Promise<ProfilePost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
        id,
        title,
        location,
        category,
        status,
        created_at,
        expires_at,
        reservations (
          id
        )
      `,
    )
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as ProfilePostRow[]).map((post) => ({
    id: post.id,
    title: post.title,
    location: post.location,
    category: post.category,
    status: post.status,
    createdAt: post.created_at,
    expiresAt: post.expires_at,
    reservationCount: post.reservations?.length ?? 0,
  }));
}

export async function fetchReservedItems(
  userId: string,
): Promise<ReservedItem[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select(
      `
        id,
        status,
        expires_at,
        created_at,
        posts (
          id,
          title,
          location,
          status
        )
      `,
    )
    .eq('requester_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as ReservedItemRow[]).map((reservation) => ({
    id: reservation.id,
    status: reservation.status,
    expiresAt: reservation.expires_at,
    createdAt: reservation.created_at,
    post: reservation.posts,
  }));
}

export async function updateProfileSettings(input: {
  userId: string;
  displayName: string;
  location: string;
  phoneNumber: string;
}) {
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: input.displayName,
      location: input.location,
      phone_number: normalizeGeorgianPhoneNumber(input.phoneNumber),
    })
    .eq('id', input.userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteAccount() {
  const { error } = await supabase.functions.invoke('delete-account', {
    method: 'POST',
  });

  if (error) {
    throw new Error(error.message);
  }

  await supabase.auth.signOut();
}
