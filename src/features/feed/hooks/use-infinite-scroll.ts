import { useEffect, useRef } from 'react';

type UseInfiniteScrollInput = {
  enabled: boolean;
  onLoadMore: () => void;
};

export function useInfiniteScroll({
  enabled,
  onLoadMore,
}: UseInfiniteScrollInput) {
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = targetRef.current;

    if (!target || !enabled) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: '240px' },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [enabled, onLoadMore]);

  return targetRef;
}
