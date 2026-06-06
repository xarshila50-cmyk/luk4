import { cn } from '@/shared/lib/cn';

type SkeletonProps = {
  className?: string;
};

export type LoadingSkeletonVariant =
  | 'feed'
  | 'details'
  | 'account'
  | 'admin'
  | 'session'
  | 'inline';

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('bg-muted animate-pulse rounded-md', className)}
      aria-hidden="true"
    />
  );
}

type LoadingSkeletonProps = {
  title: string;
  description: string;
  variant?: LoadingSkeletonVariant;
};

export function LoadingSkeleton({
  title,
  description,
  variant = 'inline',
}: LoadingSkeletonProps) {
  const content = {
    account: <AccountSkeleton />,
    admin: <AdminSkeleton />,
    details: <DetailsSkeleton />,
    feed: <FeedSkeleton />,
    inline: <InlineSkeleton />,
    session: <SessionSkeleton />,
  }[variant];

  return (
    <div
      className={cn(
        'bg-card rounded-lg border shadow-sm',
        variant === 'inline' || variant === 'session' ? 'p-4' : 'p-0',
      )}
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">
        {title}. {description}
      </span>
      {content}
    </div>
  );
}

function InlineSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-3 w-64 max-w-full" />
    </div>
  );
}

function SessionSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="size-10 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-56 max-w-full" />
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <article
          className="bg-card overflow-hidden rounded-md border"
          key={index}
        >
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-3 p-3">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-5 w-14" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <div className="space-y-2 pt-1">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function DetailsSkeleton() {
  return (
    <section className="grid gap-6 p-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <div className="space-y-3">
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton className="aspect-square w-full" key={index} />
          ))}
        </div>
      </div>
      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-12 w-full" key={index} />
          ))}
        </div>
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48 max-w-full" />
            </div>
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </section>
  );
}

function AccountSkeleton() {
  return (
    <section className="space-y-3 p-0">
      {Array.from({ length: 3 }).map((_, index) => (
        <article className="bg-card rounded-lg border p-4" key={index}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-3 w-72 max-w-full" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function AdminSkeleton() {
  return (
    <div className="overflow-x-auto p-0">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr>
            {Array.from({ length: 5 }).map((_, index) => (
              <th className="px-4 py-3" key={index}>
                <Skeleton className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <tr className="border-t" key={rowIndex}>
              {Array.from({ length: 5 }).map((_, cellIndex) => (
                <td className="px-4 py-4" key={cellIndex}>
                  <Skeleton
                    className={cn('h-4', cellIndex === 0 ? 'w-44' : 'w-24')}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="w-full space-y-6" aria-live="polite" aria-busy="true">
      <span className="sr-only">
        Loading page. Gaachuqe is preparing this view.
      </span>
      <section className="space-y-3">
        <Skeleton className="h-8 w-3/5 max-w-md" />
        <Skeleton className="h-4 w-full max-w-2xl" />
        <Skeleton className="h-4 w-4/5 max-w-xl" />
      </section>
      <div className="bg-card rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
      <FeedSkeleton />
    </div>
  );
}
