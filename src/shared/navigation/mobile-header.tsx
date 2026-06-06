import { Gift } from 'lucide-react';
import { Link } from 'react-router-dom';

import { LanguageSwitcher } from '@/shared/i18n/language-switcher';
import { useI18n } from '@/shared/i18n/i18n';

export function MobileHeader() {
  const { localizedPath, t } = useI18n();

  return (
    <div className="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 md:hidden">
      <Link className="flex min-w-0 items-center gap-3" to={localizedPath('/')}>
        <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
          <Gift className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-base leading-none font-semibold">Gaachuqe</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {t('Free giving in Georgia')}
          </p>
        </div>
      </Link>
      <LanguageSwitcher />
    </div>
  );
}
