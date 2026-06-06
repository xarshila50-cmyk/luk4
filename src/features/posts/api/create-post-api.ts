import type { FeedPost } from '@/features/feed/types/feed';
import { supabase } from '@/shared/lib/supabase';

import type { CreatePostFormValues } from '../validation/create-post-schema';

type CreatePostInput = CreatePostFormValues & {
  ownerId: string;
};

export async function createPost(input: CreatePostInput): Promise<FeedPost> {
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      owner_id: input.ownerId,
      title: input.title,
      description: input.description,
      category: input.category,
      condition: 'good',
      location: input.city,
      status: 'available',
    })
    .select(
      'id, title, description, location, status, category, created_at, expires_at',
    )
    .single();

  if (postError) {
    throw new Error(postError.message);
  }

  const uploadedPaths: string[] = [];

  try {
    for (const [index, photo] of input.photos.entries()) {
      const storagePath = `${post.id}/${crypto.randomUUID()}-${photo.name}`;
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(storagePath, photo, {
          cacheControl: '3600',
          contentType: photo.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      uploadedPaths.push(storagePath);

      const { error: imageError } = await supabase.from('post_images').insert({
        post_id: post.id,
        storage_path: storagePath,
        sort_order: index,
      });

      if (imageError) {
        throw new Error(imageError.message);
      }
    }
  } catch (error) {
    await cleanupFailedPost(post.id, uploadedPaths);
    throw error;
  }

  const imageUrl = uploadedPaths[0]
    ? await createSignedImageUrl(uploadedPaths[0])
    : null;

  return {
    id: post.id,
    title: post.title,
    description: post.description,
    location: post.location,
    status: 'available',
    category: post.category,
    createdAt: post.created_at,
    expiresAt: post.expires_at,
    imageUrl,
  };
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

async function cleanupFailedPost(postId: string, storagePaths: string[]) {
  if (storagePaths.length > 0) {
    await supabase.storage.from('post-images').remove(storagePaths);
  }

  await supabase.from('posts').delete().eq('id', postId);
}
