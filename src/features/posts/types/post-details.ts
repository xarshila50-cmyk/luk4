import type { FeedCategory, FeedStatus } from '@/features/feed/types/feed';

export type PostDetailsImage = {
  id: string;
  storagePath: string;
  url: string | null;
};

export type PostOwner = {
  id: string;
  displayName: string;
  location: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
};

export type PostDetails = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: FeedCategory;
  condition: 'new' | 'good' | 'used' | 'needs_repair';
  location: string;
  status: FeedStatus;
  createdAt: string;
  expiresAt: string;
  images: PostDetailsImage[];
  owner: PostOwner | null;
  activeReservation: {
    id: string;
    requesterId: string;
    expiresAt: string;
    status: 'pending' | 'accepted';
  } | null;
};
