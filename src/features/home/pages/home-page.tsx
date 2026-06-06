import { useCallback, useMemo, useState } from 'react';

import { FeedFilters } from '@/features/feed/components/feed-filters';
import { PostCard } from '@/features/feed/components/post-card';
import { useFeed } from '@/features/feed/hooks/use-feed';
import { useInfiniteScroll } from '@/features/feed/hooks/use-infinite-scroll';
import type { FeedFilters as FeedFiltersValue } from '@/features/feed/types/feed';
import { EmptyState } from '@/shared/components/empty-state';
import { LoadingState } from '@/shared/components/loading-state';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';

const initialFilters: FeedFiltersValue = {
  search: '',
  category: 'all',
  city: 'all',
  status: 'all',
};

export function HomePage() {
  const { t } = useI18n();
  const [filters, setFilters] = useState<FeedFiltersValue>(initialFilters);
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = useFeed({
    ...filters,
    search: filters.search.trim(),
  });

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onLoadMore: loadMore,
  });

  return (
    <PageContainer className="gap-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-normal">
          {t('Free items in Georgia')}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-7">
          {t(
            'Find unwanted items people are giving away and help keep useful things out of waste.',
          )}
        </p>
      </section>

      <FeedFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <LoadingState
          title={t('Loading free items')}
          description={t('Gaachuqe is loading the latest posts.')}
          variant="feed"
        />
      ) : null}

      {isError ? (
        <div className="bg-card rounded-lg border p-4" role="alert">
          <h2 className="text-destructive font-semibold">
            {t('Could not load feed')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {error instanceof Error ? error.message : t('Please try again.')}
          </p>
        </div>
      ) : null}

      {!isLoading && !isError && posts.length === 0 ? (
        <EmptyState
          title={t('No free items found')}
          description={t(
            'Try changing your search or filters to see more available items.',
          )}
        />
      ) : null}

      {posts.length > 0 ? (
        <section
          aria-label={t('Free item feed')}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4"
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      ) : null}

      <div ref={loadMoreRef} className="min-h-8">
        {isFetchingNextPage ? (
          <LoadingState
            title={t('Loading more items')}
            description={t('More free items are being loaded.')}
            variant="inline"
          />
        ) : null}
      </div>

      {hasNextPage ? (
        <Button
          className="self-center"
          disabled={isFetchingNextPage}
          type="button"
          variant="outline"
          onClick={loadMore}
        >
          {isFetchingNextPage ? t('Loading...') : t('Load more')}
        </Button>
      ) : null}
    </PageContainer>
  );
}
