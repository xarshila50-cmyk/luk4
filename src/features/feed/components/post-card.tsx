import { CalendarDays, ImageIcon, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useI18n } from '@/shared/i18n/i18n';
import type { FeedPost } from '../types/feed';
import { StatusBadge } from './status-badge';

type PostCardProps = {
  post: FeedPost;
};

export function PostCard({ post }: PostCardProps) {
  const { language, localizedPath, t } = useI18n();

  return (
    <article className="bg-card overflow-hidden rounded-md border shadow-sm">
      <div className="bg-muted aspect-[16/10] w-full">
        {post.imageUrl ? (
          <img
            className="h-full w-full object-cover"
            src={post.imageUrl}
            alt=""
            loading="lazy"
          />
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center">
            <ImageIcon className="size-9" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="relative space-y-2 p-3">
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <h2 className="line-clamp-2 text-sm leading-5 font-semibold sm:text-base sm:leading-6">
            <Link
              className="focus-visible:ring-ring rounded-sm outline-none focus-visible:ring-2"
              to={localizedPath(`/posts/${post.id}`)}
            >
              <span className="absolute inset-0" aria-hidden="true" />
              {post.title}
            </Link>
          </h2>
          <StatusBadge status={post.status} />
        </div>

        <p className="text-muted-foreground line-clamp-2 text-xs leading-5 sm:text-sm">
          {post.description}
        </p>

        <div className="text-muted-foreground flex flex-col gap-1.5 text-xs sm:text-sm">
          <span className="flex min-w-0 items-center gap-1.5">
            <MapPin
              className="size-3.5 shrink-0 sm:size-4"
              aria-hidden="true"
            />
            <span className="truncate">{t(post.location)}</span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <CalendarDays
              className="size-3.5 shrink-0 sm:size-4"
              aria-hidden="true"
            />
            <span className="truncate">
              {formatDate(post.createdAt, language)}
            </span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <CalendarDays
              className="size-3.5 shrink-0 sm:size-4"
              aria-hidden="true"
            />
            <span className="truncate">
              {t('Expires')} {formatDate(post.expiresAt, language)}
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}

function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language === 'ge' ? 'ka-GE' : 'en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
