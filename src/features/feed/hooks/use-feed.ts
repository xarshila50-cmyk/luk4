import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchFeedPage } from '../api/feed-api';
import type { FeedFilters } from '../types/feed';

export function useFeed(filters: FeedFilters) {
  return useInfiniteQuery({
    queryKey: ['feed', filters],
    queryFn: ({ pageParam }) => fetchFeedPage({ pageParam, filters }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
