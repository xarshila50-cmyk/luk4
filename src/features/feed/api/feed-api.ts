import { supabase } from '@/shared/lib/supabase';

import type { FeedFilters, FeedPost } from '../types/feed';

const PAGE_SIZE = 12;

type PostImageRow = {
  storage_path: string;
  sort_order: number;
};

type FeedPostRow = {
  id: string;
  title: string;
  description: string;
  location: string;
  status: FeedPost['status'];
  category: FeedPost['category'];
  created_at: string;
  expires_at: string;
  post_images: PostImageRow[] | null;
};

type FetchFeedPageInput = {
  pageParam: number;
  filters: FeedFilters;
};

export type FeedPage = {
  items: FeedPost[];
  nextPage: number | null;
};

export async function fetchFeedPage({
  pageParam,
  filters,
}: FetchFeedPageInput): Promise<FeedPage> {
  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from('posts')
    .select(
      `
        id,
        title,
        description,
        location,
        status,
        category,
        created_at,
        expires_at,
        post_images (
          storage_path,
          sort_order
        )
      `,
    )
    .in(
      'status',
      filters.status === 'all'
        ? ['available', 'reserved']
        : [filters.status],
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (filters.search) {
    const search = escapeSearchPattern(filters.search);
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }

  if (filters.city !== 'all') {
    query = query.ilike('location', `%${escapeSearchPattern(filters.city)}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as FeedPostRow[];
  const items = await Promise.all(rows.map(mapFeedPost));

  return {
    items,
    nextPage: rows.length === PAGE_SIZE ? pageParam + 1 : null,
  };
}

async function mapFeedPost(post: FeedPostRow): Promise<FeedPost> {
  const firstImage = [...(post.post_images ?? [])].sort(
    (first, second) => first.sort_order - second.sort_order,
  )[0];

  return {
    id: post.id,
    title: post.title,
    description: post.description,
    location: post.location,
    status: post.status,
    category: post.category,
    createdAt: post.created_at,
    expiresAt: post.expires_at,
    imageUrl: firstImage ? await createImageUrl(firstImage.storage_path) : null,
  };
}

async function createImageUrl(storagePath: string) {
  const { data, error } = await supabase.storage
    .from('post-images')
    .createSignedUrl(storagePath, 600);

  if (error) {
    console.error('Unable to create post image URL', error);
    return null;
  }

  return data.signedUrl;
}

function escapeSearchPattern(value: string) {
  return value.replaceAll('%', '\\%').replaceAll('_', '\\_').trim();
}
