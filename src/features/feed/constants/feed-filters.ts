import { postCityOptions } from '@/features/posts/constants/post-options';

import type { FeedCategory, FeedStatus } from '../types/feed';

export const categoryOptions: Array<{
  label: string;
  value: FeedCategory | 'all';
}> = [
  { label: 'All categories', value: 'all' },
  { label: 'Clothing', value: 'clothing' },
  { label: 'HomeCategory', value: 'home' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Books', value: 'books' },
  { label: 'Children', value: 'children' },
  { label: 'Sports', value: 'sports' },
  { label: 'Other', value: 'other' },
];

export const cityOptions = [
  { label: 'All cities', value: 'all' },
  ...postCityOptions.map((city) => ({ label: city, value: city })),
] as const;

export const statusOptions: Array<{
  label: string;
  value: FeedStatus | 'all';
}> = [
  { label: 'Any status', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'Reserved', value: 'reserved' },
];
