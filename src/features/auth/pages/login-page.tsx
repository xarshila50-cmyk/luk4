import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { loginWithEmail } from '@/features/auth/api/auth-api';
import { AuthFormField } from '@/features/auth/components/auth-form-field';
import { useAuth } from '@/features/auth/context/use-auth';
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/validation/auth-schemas';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { localizedPath, t } = useI18n();
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof location.state.from === 'string'
      ? location.state.from
      : localizedPath('/profile');

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);

    try {
      await loginWithEmail(values);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('Login failed.'));
    }
  }

  if (!isLoading && isAuthenticated) {
    return <Navigate to={localizedPath('/profile')} replace />;
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8">
      <div className="bg-card rounded-lg border p-5 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t('Log in')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('Use your email and password to access Gaachuqe.')}
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <AuthFormField
            autoComplete="email"
            error={errors.email}
            id="email"
            inputMode="email"
            label={t('Email')}
            placeholder="name@example.com"
            registration={register('email')}
            type="email"
          />
          <AuthFormField
            autoComplete="current-password"
            error={errors.password}
            id="password"
            label={t('Password')}
            registration={register('password')}
            type="password"
          />

          {formError ? (
            <p
              className="text-destructive rounded-md border border-current p-3 text-sm"
              role="alert"
            >
              {t(formError)}
            </p>
          ) : null}

          <Button
            className="w-full"
            disabled={isSubmitting || isLoading}
            type="submit"
          >
            <LogIn className="size-4" aria-hidden="true" />
            {isSubmitting ? t('Logging in...') : t('Log in')}
          </Button>
        </form>

        <p className="text-muted-foreground mt-5 text-center text-sm">
          {t('No account?')}{' '}
          <Link
            className="text-primary font-medium underline-offset-4 hover:underline"
            to={localizedPath('/register')}
          >
            {t('Register')}
          </Link>
        </p>
      </div>
    </main>
  );
}
