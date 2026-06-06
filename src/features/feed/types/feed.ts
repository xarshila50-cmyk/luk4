export type FeedCategory =
  | 'clothing'
  | 'home'
  | 'electronics'
  | 'books'
  | 'children'
  | 'sports'
  | 'other';

export type FeedStatus = 'available' | 'reserved' | 'given';

export type FeedFilters = {
  search: string;
  category: FeedCategory | 'all';
  city: string | 'all';
  status: FeedStatus | 'all';
};

export type FeedPost = {
  id: string;
  title: string;
  description: string;
  location: string;
  status: FeedStatus;
  category: FeedCategory;
  createdAt: string;
  expiresAt: string;
  imageUrl: string | null;
};
