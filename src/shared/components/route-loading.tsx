import { PageSkeleton } from '@/shared/components/skeleton';

export function RouteLoading() {
  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 pb-24 sm:px-6 md:py-8 md:pb-8 lg:px-8"
    >
      <PageSkeleton />
    </main>
  );
}
