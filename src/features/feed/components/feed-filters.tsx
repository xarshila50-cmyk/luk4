import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { useId, useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import {
  categoryOptions,
  cityOptions,
  statusOptions,
} from '../constants/feed-filters';
import type { FeedFilters as FeedFiltersValue } from '../types/feed';

type FeedFiltersProps = {
  filters: FeedFiltersValue;
  onChange: (filters: FeedFiltersValue) => void;
};

export function FeedFilters({ filters, onChange }: FeedFiltersProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const selectedCity = filters.city === 'all' ? '' : filters.city;
  const activeFilterCount = [
    filters.search.trim(),
    filters.category !== 'all',
    filters.city !== 'all',
    filters.status !== 'all',
  ].filter(Boolean).length;

  return (
    <section
      className="bg-card rounded-lg border p-4 shadow-sm"
      aria-label="Feed filters"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            {t('Filters')}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {activeFilterCount > 0
              ? `${activeFilterCount} ${t('active')}`
              : t('Search, category, city, and status')}
          </p>
        </div>
        <Button
          aria-controls={panelId}
          aria-expanded={isOpen}
          className="shrink-0 px-3"
          type="button"
          variant="outline"
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? t('Close') : t('Open')}
          <ChevronDown
            className={`size-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </Button>
      </div>

      {isOpen ? (
        <div id={panelId} className="mt-4">
          <div className="relative">
            <Search
              className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              aria-label={t('Search free items')}
              className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border pr-3 pl-9 text-base outline-none focus-visible:ring-2"
              placeholder={t('Search free items')}
              type="search"
              value={filters.search}
              onChange={(event) =>
                onChange({ ...filters, search: event.target.value })
              }
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <label className="space-y-2">
              <span className="text-sm font-medium">{t('Category')}</span>
              <select
                className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-base outline-none focus-visible:ring-2"
                value={filters.category}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    category: event.target
                      .value as FeedFiltersValue['category'],
                  })
                }
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.label)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">{t('City')}</span>
              <input
                aria-label={t('Search by city')}
                className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-base outline-none focus-visible:ring-2"
                list="feed-city-options"
                placeholder={t('Search city')}
                type="search"
                value={selectedCity}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    city: event.target.value.trim() || 'all',
                  })
                }
              />
              <datalist id="feed-city-options">
                {cityOptions.slice(1).map((option) => (
                  <option key={option.value} value={option.value} />
                ))}
              </datalist>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium">{t('Status')}</span>
              <select
                className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-base outline-none focus-visible:ring-2"
                value={filters.status}
                onChange={(event) =>
                  onChange({
                    ...filters,
                    status: event.target.value as FeedFiltersValue['status'],
                  })
                }
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.label)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}
    </section>
  );
}
