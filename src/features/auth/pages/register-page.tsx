import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { registerWithEmail } from '@/features/auth/api/auth-api';
import { AuthFormField } from '@/features/auth/components/auth-form-field';
import { useAuth } from '@/features/auth/context/use-auth';
import {
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth/validation/auth-schemas';
import { formatGeorgianPhoneNumber } from '@/features/auth/utils/georgian-phone-number';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';

export function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const { localizedPath, t } = useI18n();
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    formState: { errors, isSubmitting },
    control,
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);

    try {
      await registerWithEmail(values);
      navigate(localizedPath('/profile'), { replace: true });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : t('Registration failed.'),
      );
    }
  }

  if (!isLoading && isAuthenticated) {
    return <Navigate to={localizedPath('/profile')} replace />;
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8">
      <div className="bg-card rounded-lg border p-5 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t('Register')}</h1>
          <p className="text-muted-foreground text-sm">
            {t(
              'Create an account with your name, email, phone number, and password.',
            )}
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <AuthFormField
            autoComplete="given-name"
            error={errors.firstName}
            id="firstName"
            label={t('First name')}
            registration={register('firstName')}
            type="text"
          />
          <AuthFormField
            autoComplete="family-name"
            error={errors.lastName}
            id="lastName"
            label={t('Last name')}
            registration={register('lastName')}
            type="text"
          />
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
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="phoneNumber">
                  {t('Phone number')}
                </label>
                <input
                  aria-describedby={
                    errors.phoneNumber ? 'phoneNumber-error' : undefined
                  }
                  aria-invalid={Boolean(errors.phoneNumber)}
                  autoComplete="tel"
                  className={cn(
                    'border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-base outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
                    errors.phoneNumber &&
                      'border-destructive focus-visible:ring-destructive',
                  )}
                  id="phoneNumber"
                  inputMode="tel"
                  placeholder="(+995) 555 12 34 56"
                  type="tel"
                  value={field.value || '(+995) '}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    field.onChange(
                      formatGeorgianPhoneNumber(event.target.value),
                    )
                  }
                />
                {errors.phoneNumber ? (
                  <p
                    className="text-destructive text-sm"
                    id="phoneNumber-error"
                  >
                    {t(errors.phoneNumber.message ?? '')}
                  </p>
                ) : null}
              </div>
            )}
          />
          <AuthFormField
            autoComplete="new-password"
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
            <UserPlus className="size-4" aria-hidden="true" />
            {isSubmitting ? t('Creating account...') : t('Create account')}
          </Button>
        </form>

        <p className="text-muted-foreground mt-5 text-center text-sm">
          {t('Already registered?')}{' '}
          <Link
            className="text-primary font-medium underline-offset-4 hover:underline"
            to={localizedPath('/login')}
          >
            {t('Log in')}
          </Link>
        </p>
      </div>
    </main>
  );
}
