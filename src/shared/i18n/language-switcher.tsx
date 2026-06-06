import { Link, useLocation } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';
import { switchLanguagePath, useI18n, type Language } from './i18n';

const languageOptions: Array<{ label: string; value: Language }> = [
  { label: 'GE', value: 'ge' },
  { label: 'EN', value: 'en' },
];

export function LanguageSwitcher() {
  const { language } = useI18n();
  const location = useLocation();

  return (
    <div
      aria-label="Language"
      className="bg-card grid grid-cols-2 rounded-md border p-0.5 text-xs font-semibold"
    >
      {languageOptions.map((option) => (
        <Link
          className={cn(
            'rounded px-2.5 py-1.5 transition-colors',
            option.value === language
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )}
          key={option.value}
          to={switchLanguagePath(location.pathname, option.value)}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
