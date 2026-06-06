import { cn } from '@/shared/lib/cn';
import { useI18n } from '@/shared/i18n/i18n';

import type { FeedStatus } from '../types/feed';

const statusLabels: Record<FeedStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  given: 'Given',
};

const statusStyles: Record<FeedStatus, string> = {
  available: 'bg-primary/10 text-primary',
  reserved: 'bg-accent text-accent-foreground',
  given: 'bg-muted text-muted-foreground',
};

type StatusBadgeProps = {
  status: FeedStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useI18n();

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-md px-2 py-1 text-xs font-medium',
        statusStyles[status],
      )}
    >
      {t(statusLabels[status])}
    </span>
  );
}
