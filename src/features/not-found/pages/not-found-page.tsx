import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/ui/button';
import { localizePath, useOptionalI18n } from '@/shared/i18n/i18n';

export function NotFoundPage() {
  const i18n = useOptionalI18n();
  const t = i18n?.t ?? ((text: string) => text);
  const homePath = i18n?.localizedPath('/') ?? localizePath('/', 'ge');

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col items-start justify-center gap-4 px-4">
      <p className="text-primary text-sm font-medium">404</p>
      <h1 className="text-3xl font-semibold">{t('Page not found')}</h1>
      <p className="text-muted-foreground">
        {t('The page you requested does not exist in Gaachuqe.')}
      </p>
      <Button asChild>
        <Link to={homePath}>{t('Go home')}</Link>
      </Button>
    </main>
  );
}
