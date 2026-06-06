import { Gift } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import { useAdminStatus } from '@/features/admin/hooks/use-admin-status';
import { useAuth } from '@/features/auth/context/use-auth';
import { useUnreadReservationNotifications } from '@/features/notifications/hooks/use-unread-reservation-notifications';
import { Button } from '@/shared/components/ui/button';
import { LanguageSwitcher } from '@/shared/i18n/language-switcher';
import { useI18n } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';
import { navigationItems } from './navigation-items';

type DesktopNavbarProps = {
  isLoggingOut: boolean;
  onLogout: () => void;
};

export function DesktopNavbar({ isLoggingOut, onLogout }: DesktopNavbarProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const adminStatus = useAdminStatus();
  const unreadReservations = useUnreadReservationNotifications();
  const { localizedPath, t } = useI18n();
  const visibleItems = navigationItems.filter((item) => {
    if (item.adminOnly) {
      return isAuthenticated && Boolean(adminStatus.data);
    }

    if (item.requiresAuth) {
      return isAuthenticated;
    }

    if (item.guestOnly) {
      return !isAuthenticated;
    }

    return true;
  });

  return (
    <div className="mx-auto hidden min-h-16 w-full max-w-5xl items-center justify-between gap-6 px-6 py-3 md:flex lg:px-8">
      <Link className="flex items-center gap-3" to={localizedPath('/')}>
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

      <nav
        aria-label={t('Primary navigation')}
        className="flex items-center gap-1"
      >
        {visibleItems.map((item) => (
          <Button asChild key={item.href} variant="outline">
            <NavLink
              className={({ isActive }) =>
                cn(isActive && 'bg-accent text-accent-foreground')
              }
              to={localizedPath(item.href)}
            >
              <span className="relative">
                <item.icon className="size-4" aria-hidden="true" />
                {item.href === '/profile' &&
                Number(unreadReservations.data ?? 0) > 0 ? (
                  <span
                    aria-label={t('New reservation activity')}
                    className="bg-destructive absolute -top-1 -right-1 size-2 rounded-full"
                  />
                ) : null}
              </span>
              {t(item.labelKey)}
            </NavLink>
          </Button>
        ))}
        {!isLoading && isAuthenticated ? (
          <Button disabled={isLoggingOut} type="button" onClick={onLogout}>
            {isLoggingOut ? t('Logging out...') : t('Log out')}
          </Button>
        ) : null}
        <LanguageSwitcher />
      </nav>
    </div>
  );
}
