import { supabase } from '@/shared/lib/supabase';

import type { PostDetails } from '../types/post-details';
import type { CreatePostFormValues } from '../validation/create-post-schema';

type PostDetailsRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: PostDetails['category'];
  condition: PostDetails['condition'];
  location: string;
  status: PostDetails['status'] | 'archived';
  created_at: string;
  expires_at: string;
  profiles: {
    id: string;
    display_name: string;
    location: string;
    avatar_url: string | null;
    phone_number: string | null;
  } | null;
  post_images: Array<{
    id: string;
    storage_path: string;
    sort_order: number;
  }> | null;
  reservations: Array<{
    id: string;
    requester_id: string;
    status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';
    expires_at: string | null;
  }> | null;
};

export async function fetchPostDetails(postId: string): Promise<PostDetails> {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
        id,
        owner_id,
        title,
        description,
        category,
        condition,
        location,
        status,
        created_at,
        expires_at,
        profiles (
          id,
          display_name,
          location,
          avatar_url,
          phone_number
        ),
        post_images (
          id,
          storage_path,
          sort_order
        ),
        reservations (
          id,
          requester_id,
          status,
          expires_at
        )
      `,
    )
    .eq('id', postId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const row = data as unknown as PostDetailsRow;

  if (row.status === 'archived') {
    throw new Error('This item is no longer available.');
  }

  const sortedImages = [...(row.post_images ?? [])].sort(
    (first, second) => first.sort_order - second.sort_order,
  );

  const images = await Promise.all(
    sortedImages.map(async (image) => ({
      id: image.id,
      storagePath: image.storage_path,
      url: await createSignedImageUrl(image.storage_path),
    })),
  );

  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    description: row.description,
    category: row.category,
    condition: row.condition,
    location: row.location,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    images,
    owner: row.profiles
      ? {
          id: row.profiles.id,
          displayName: row.profiles.display_name,
          location: row.profiles.location,
          avatarUrl: row.profiles.avatar_url,
          phoneNumber: row.profiles.phone_number,
        }
      : null,
    activeReservation:
      row.reservations
        ?.filter(
          (reservation) =>
            (reservation.status === 'pending' ||
              reservation.status === 'accepted') &&
            Boolean(reservation.expires_at),
        )
        .map((reservation) => ({
          id: reservation.id,
          requesterId: reservation.requester_id,
          expiresAt: reservation.expires_at as string,
          status: reservation.status as 'pending' | 'accepted',
        }))[0] ?? null,
  };
}

export async function reservePost(postId: string) {
  const { error } = await supabase.rpc('reserve_post', {
    target_post_id: postId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function cancelReservation(reservationId: string) {
  const { error } = await supabase.rpc('cancel_reservation', {
    target_reservation_id: reservationId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function markPostGiven(postId: string) {
  const { error } = await supabase.rpc('mark_post_given', {
    target_post_id: postId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deletePost(post: PostDetails) {
  const storagePaths = post.images.map((image) => image.storagePath);

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('post-images')
      .remove(storagePaths);

    if (storageError) {
      throw new Error(storageError.message);
    }
  }

  const { error } = await supabase.from('posts').delete().eq('id', post.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updatePostDetails(
  postId: string,
  values: Omit<CreatePostFormValues, 'photos'>,
) {
  const { error } = await supabase
    .from('posts')
    .update({
      title: values.title,
      description: values.description,
      category: values.category,
      location: values.city,
    })
    .eq('id', postId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createPostReport(input: {
  body: string;
  postId: string;
  reporterId: string;
  subject: string;
}) {
  const { error } = await supabase.from('reports').insert({
    body: input.body,
    post_id: input.postId,
    reporter_id: input.reporterId,
    subject: input.subject,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function createSignedImageUrl(storagePath: string) {
  const { data, error } = await supabase.storage
    .from('post-images')
    .createSignedUrl(storagePath, 600);

  if (error) {
    console.error('Unable to create post image URL', error);
    return null;
  }

  return data.signedUrl;
}
