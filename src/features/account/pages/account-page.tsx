import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart3,
  Eye,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Settings,
  Trash2,
  User,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { formatGeorgianPhoneNumber } from '@/features/auth/utils/georgian-phone-number';
import { useAuth } from '@/features/auth/context/use-auth';
import { StatusBadge } from '@/features/feed/components/status-badge';
import {
  cancelReservation,
  deletePost,
  fetchPostDetails,
  markPostGiven,
} from '@/features/posts/api/post-details-api';
import { ReservationCountdown } from '@/features/posts/components/reservation-countdown';
import { markReservationNotificationsRead } from '@/features/notifications/api/notifications-api';
import { EmptyState } from '@/shared/components/empty-state';
import { LoadingState } from '@/shared/components/loading-state';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';
import { cn } from '@/shared/lib/cn';

import {
  deleteAccount,
  fetchMyPosts,
  fetchProfileSummary,
  fetchReservedItems,
  updateProfileSettings,
  type ProfilePost,
  type ReservedItem,
} from '../api/profile-api';
import {
  profileSettingsSchema,
  type ProfileSettingsValues,
} from '../validation/profile-settings-schema';

type ProfileTab = 'posts' | 'reserved' | 'settings';

export function AccountPage() {
  const { user } = useAuth();
  const { localizedPath, t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [actionError, setActionError] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ['profile-summary', user?.id],
    queryFn: () => fetchProfileSummary(user?.id ?? ''),
    enabled: Boolean(user?.id),
  });

  const postsQuery = useQuery({
    queryKey: ['my-posts', user?.id],
    queryFn: () => fetchMyPosts(user?.id ?? ''),
    enabled: Boolean(user?.id),
  });

  const reservationsQuery = useQuery({
    queryKey: ['reserved-items', user?.id],
    queryFn: () => fetchReservedItems(user?.id ?? ''),
    enabled: Boolean(user?.id),
  });

  const stats = useMemo(() => {
    const posts = postsQuery.data ?? [];
    const reservations = reservationsQuery.data ?? [];

    return {
      totalPosts: posts.length,
      availablePosts: posts.filter((post) => post.status === 'available')
        .length,
      reservedPosts: posts.filter((post) => post.status === 'reserved').length,
      reservedItems: reservations.filter(
        (reservation) =>
          reservation.status === 'pending' || reservation.status === 'accepted',
      ).length,
    };
  }, [postsQuery.data, reservationsQuery.data]);

  const displayName =
    profileQuery.data?.displayName ??
    (typeof user?.user_metadata.display_name === 'string'
      ? user.user_metadata.display_name
      : t('Your account'));

  const isLoading =
    profileQuery.isLoading ||
    postsQuery.isLoading ||
    reservationsQuery.isLoading;
  const error =
    profileQuery.error ?? postsQuery.error ?? reservationsQuery.error;

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    void markReservationNotificationsRead(user.id).then(() =>
      queryClient.invalidateQueries({
        queryKey: ['unread-reservation-notifications', user.id],
      }),
    );
  }, [queryClient, user?.id]);

  return (
    <PageContainer className="gap-6">
      <section className="bg-card rounded-lg border p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center overflow-hidden rounded-md">
              {profileQuery.data?.avatarUrl ? (
                <img
                  className="h-full w-full object-cover"
                  src={profileQuery.data.avatarUrl}
                  alt=""
                />
              ) : (
                <User className="size-6" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold">{t('Profile')}</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {displayName}
              </p>
            </div>
          </div>
          <div className="text-muted-foreground flex flex-col gap-2 text-sm sm:items-end">
            <span className="flex items-center gap-2">
              <Phone className="size-4" aria-hidden="true" />
              {profileQuery.data?.phoneNumber ??
                user?.phone ??
                t('Phone unavailable')}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden="true" />
              {profileQuery.data?.location
                ? t(profileQuery.data.location)
                : t('Georgia')}
            </span>
          </div>
        </div>
      </section>

      <section
        aria-label={t('Profile statistics')}
        className="grid gap-3 sm:grid-cols-4"
      >
        <StatCard label={t('Total posts')} value={stats.totalPosts} />
        <StatCard label={t('Available')} value={stats.availablePosts} />
        <StatCard label={t('Reserved posts')} value={stats.reservedPosts} />
        <StatCard label={t('My reservations')} value={stats.reservedItems} />
      </section>

      <div className="bg-card grid grid-cols-3 gap-1 rounded-lg border p-1">
        <TabButton
          active={activeTab === 'posts'}
          label={t('My Posts')}
          onClick={() => setActiveTab('posts')}
        />
        <TabButton
          active={activeTab === 'reserved'}
          label={t('Reserved Items')}
          onClick={() => setActiveTab('reserved')}
        />
        <TabButton
          active={activeTab === 'settings'}
          label={t('Settings')}
          onClick={() => setActiveTab('settings')}
        />
      </div>

      {isLoading ? (
        <LoadingState
          title={t('Loading profile')}
          description={t('Gaachuqe is loading your account.')}
          variant="account"
        />
      ) : null}

      {error ? (
        <div className="bg-card rounded-lg border p-4" role="alert">
          <h2 className="text-destructive font-semibold">
            {t('Could not load profile')}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {error instanceof Error ? error.message : t('Please try again.')}
          </p>
        </div>
      ) : null}

      {!isLoading && !error && activeTab === 'posts' ? (
        <MyPostsSection
          posts={postsQuery.data ?? []}
          onDeleted={async () => {
            await queryClient.invalidateQueries({
              queryKey: ['my-posts', user?.id],
            });
            await queryClient.invalidateQueries({ queryKey: ['feed'] });
          }}
          onError={setActionError}
        />
      ) : null}

      {!isLoading && !error && activeTab === 'reserved' ? (
        <ReservedItemsSection
          reservations={reservationsQuery.data ?? []}
          onCancelled={async () => {
            await queryClient.invalidateQueries({
              queryKey: ['reserved-items', user?.id],
            });
            await queryClient.invalidateQueries({ queryKey: ['feed'] });
          }}
        />
      ) : null}

      {!isLoading && !error && activeTab === 'settings' && user ? (
        <SettingsSection
          defaultValues={{
            displayName,
            location: profileQuery.data?.location ?? 'Georgia',
            phoneNumber: formatGeorgianPhoneNumber(
              profileQuery.data?.phoneNumber ?? user.phone ?? '',
            ),
          }}
          userId={user.id}
          onSaved={async () => {
            await queryClient.invalidateQueries({
              queryKey: ['profile-summary', user.id],
            });
          }}
          onAccountDeleted={() => {
            queryClient.clear();
            navigate(localizedPath('/'), { replace: true });
          }}
        />
      ) : null}

      {actionError ? (
        <p
          className="text-destructive rounded-md border border-current p-3 text-sm"
          role="alert"
        >
          {actionError}
        </p>
      ) : null}
    </PageContainer>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <BarChart3 className="size-4" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={
        active
          ? 'bg-primary text-primary-foreground rounded-md px-3 py-2 text-sm font-medium'
          : 'text-muted-foreground hover:bg-accent rounded-md px-3 py-2 text-sm font-medium'
      }
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function MyPostsSection({
  onDeleted,
  onError,
  posts,
}: {
  onDeleted: () => Promise<void>;
  onError: (message: string | null) => void;
  posts: ProfilePost[];
}) {
  const { localizedPath, t } = useI18n();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [markingGivenId, setMarkingGivenId] = useState<string | null>(null);
  const [statsPostId, setStatsPostId] = useState<string | null>(null);

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description={t('Create a post when you have an item to give away.')}
      />
    );
  }

  async function handleDelete(postId: string) {
    if (
      !window.confirm(t('Delete this post permanently? This cannot be undone.'))
    ) {
      return;
    }

    setDeletingId(postId);
    onError(null);

    try {
      const details = await fetchPostDetails(postId);
      await deletePost(details);
      await onDeleted();
    } catch (error) {
      onError(
        error instanceof Error ? error.message : t('Could not delete post.'),
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleMarkGiven(postId: string) {
    if (
      !window.confirm(
        t('Mark this item as given? Active reservations will be completed.'),
      )
    ) {
      return;
    }

    setMarkingGivenId(postId);
    onError(null);

    try {
      await markPostGiven(postId);
      await onDeleted();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : t('Could not mark post as given.'),
      );
    } finally {
      setMarkingGivenId(null);
    }
  }

  return (
    <section className="space-y-3" aria-label="My posts">
      {posts.map((post) => (
        <article className="bg-card rounded-lg border p-4" key={post.id}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">{post.title}</h2>
                {post.status !== 'archived' ? (
                  <StatusBadge status={post.status} />
                ) : null}
              </div>
              <p className="text-muted-foreground text-sm">
                {t(post.location)} - {formatCategory(post.category, t)} -{' '}
                {post.reservationCount} {t('reservations')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                aria-expanded={statsPostId === post.id}
                type="button"
                variant="outline"
                onClick={() =>
                  setStatsPostId((current) =>
                    current === post.id ? null : post.id,
                  )
                }
              >
                <BarChart3 className="size-4" aria-hidden="true" />
                {t('Statistics')}
              </Button>
              <Button asChild variant="outline">
                <Link to={localizedPath(`/posts/${post.id}`)}>
                  <Eye className="size-4" aria-hidden="true" />
                  {t('View')}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={`${localizedPath(`/posts/${post.id}`)}?edit=1`}>
                  <Pencil className="size-4" aria-hidden="true" />
                  {t('Edit')}
                </Link>
              </Button>
              <Button
                disabled={post.status === 'given' || markingGivenId === post.id}
                type="button"
                variant="outline"
                onClick={() => void handleMarkGiven(post.id)}
              >
                {markingGivenId === post.id
                  ? t('Saving...')
                  : post.status === 'given'
                    ? t('Given')
                    : t('Mark given')}
              </Button>
              <Button
                disabled={deletingId === post.id}
                type="button"
                variant="outline"
                onClick={() => void handleDelete(post.id)}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                {deletingId === post.id ? t('Deleting...') : t('Delete')}
              </Button>
            </div>
          </div>
          {statsPostId === post.id ? <PostStatistics post={post} /> : null}
        </article>
      ))}
    </section>
  );
}

function PostStatistics({ post }: { post: ProfilePost }) {
  const { language, t } = useI18n();
  const statusLabel =
    post.status === 'archived' ? t('Archived') : formatCategory(post.status, t);

  return (
    <dl className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-4">
      <StatisticDetail label={t('Status')} value={statusLabel} />
      <StatisticDetail
        label={t('Reservations')}
        value={String(post.reservationCount)}
      />
      <StatisticDetail
        label={t('Created')}
        value={formatDate(post.createdAt, language)}
      />
      <StatisticDetail
        label={t('Expires')}
        value={formatDate(post.expiresAt, language)}
      />
    </dl>
  );
}

function StatisticDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <dt className="text-muted-foreground text-xs font-medium uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}

function ReservedItemsSection({
  onCancelled,
  reservations,
}: {
  onCancelled: () => Promise<void>;
  reservations: ReservedItem[];
}) {
  const { localizedPath, t } = useI18n();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (reservations.length === 0) {
    return (
      <EmptyState
        title="No reserved items"
        description={t('Reserved items will appear here.')}
      />
    );
  }

  async function handleCancelReservation(reservationId: string) {
    if (!window.confirm(t('Cancel your reservation for this item?'))) {
      return;
    }

    setCancellingId(reservationId);
    setErrorMessage(null);

    try {
      await cancelReservation(reservationId);
      await onCancelled();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t('Could not cancel reservation.'),
      );
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <section className="space-y-3" aria-label="Reserved items">
      {errorMessage ? (
        <p
          className="text-destructive rounded-md border border-current p-3 text-sm"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
      {reservations.map((reservation) => (
        <article className="bg-card rounded-lg border p-4" key={reservation.id}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">
                {reservation.post?.title ?? t('Unavailable item')}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {reservation.post?.location
                  ? t(reservation.post.location)
                  : t('Location unavailable')}{' '}
                - {formatCategory(reservation.status, t)}
              </p>
            </div>
            {reservation.post ? (
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link to={localizedPath(`/posts/${reservation.post.id}`)}>
                    {t('View')}
                  </Link>
                </Button>
                {reservation.status === 'pending' ||
                reservation.status === 'accepted' ? (
                  <Button
                    disabled={cancellingId === reservation.id}
                    type="button"
                    variant="outline"
                    onClick={() => void handleCancelReservation(reservation.id)}
                  >
                    {cancellingId === reservation.id
                      ? t('Cancelling...')
                      : t('Unreserve')}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
          {reservation.expiresAt &&
          (reservation.status === 'pending' ||
            reservation.status === 'accepted') ? (
            <div className="mt-3">
              <ReservationCountdown expiresAt={reservation.expiresAt} />
            </div>
          ) : null}
        </article>
      ))}
    </section>
  );
}

function SettingsSection({
  defaultValues,
  onAccountDeleted,
  onSaved,
  userId,
}: {
  defaultValues: ProfileSettingsValues;
  onAccountDeleted: () => void;
  onSaved: () => Promise<void>;
  userId: string;
}) {
  const { t } = useI18n();
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const {
    formState: { errors, isSubmitting },
    control,
    handleSubmit,
    register,
    reset,
  } = useForm<ProfileSettingsValues>({
    resolver: zodResolver(profileSettingsSchema),
    values: defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  async function onSubmit(values: ProfileSettingsValues) {
    setMessage(null);
    setErrorMessage(null);

    try {
      await updateProfileSettings({ userId, ...values });
      await onSaved();
      setMessage(t('Settings saved.'));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t('Settings could not be saved.'),
      );
    }
  }

  return (
    <>
      <section className="bg-card rounded-lg border p-5">
        <div className="mb-5 flex items-center gap-2">
          <Settings
            className="text-muted-foreground size-5"
            aria-hidden="true"
          />
          <h2 className="text-lg font-semibold">{t('Account settings')}</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <label className="space-y-2">
            <span className="text-sm font-medium">{t('Display name')}</span>
            <input
              className={inputClassName(Boolean(errors.displayName))}
              {...register('displayName')}
            />
            <FieldError message={errors.displayName?.message} />
          </label>
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <label className="space-y-2">
                <span className="text-sm font-medium">{t('Phone number')}</span>
                <input
                  className={inputClassName(Boolean(errors.phoneNumber))}
                  inputMode="tel"
                  type="tel"
                  value={field.value || '(+995) '}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    field.onChange(
                      formatGeorgianPhoneNumber(event.target.value),
                    )
                  }
                />
                <FieldError message={errors.phoneNumber?.message} />
              </label>
            )}
          />
          <label className="space-y-2">
            <span className="text-sm font-medium">{t('Location')}</span>
            <input
              className={inputClassName(Boolean(errors.location))}
              {...register('location')}
            />
            <FieldError message={errors.location?.message} />
          </label>
          {errorMessage ? (
            <p
              className="text-destructive rounded-md border border-current p-3 text-sm"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}
          {message ? (
            <p className="text-primary text-sm">{t(message)}</p>
          ) : null}
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? t('Saving...') : t('Save settings')}
          </Button>
        </form>
      </section>

      <section className="bg-card border-destructive/40 rounded-lg border p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t('Delete account')}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {t(
                'Permanently remove your profile, posts, reservations, and post images.',
              )}
            </p>
          </div>
          <Button
            className="border-destructive text-destructive hover:bg-destructive hover:text-primary-foreground"
            type="button"
            variant="outline"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t('Delete account')}
          </Button>
        </div>
      </section>

      {isDeleteModalOpen ? (
        <DeleteAccountModal
          onClose={() => setIsDeleteModalOpen(false)}
          onDeleted={onAccountDeleted}
        />
      ) : null}
    </>
  );
}

function DeleteAccountModal({
  onClose,
  onDeleted,
}: {
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { t } = useI18n();
  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isConfirmed = confirmation === 'DELETE';

  async function handleDelete() {
    if (!isConfirmed || isDeleting) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteAccount();
      onDeleted();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : t('Account could not be deleted.'),
      );
      setIsDeleting(false);
    }
  }

  return (
    <div
      aria-labelledby="delete-account-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
    >
      <div className="bg-card w-full max-w-md rounded-lg border p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="bg-destructive/10 text-destructive flex size-10 shrink-0 items-center justify-center rounded-md">
            <Trash2 className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold" id="delete-account-title">
              {t('Delete account permanently')}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {t(
                'This removes your profile, posts, post images, and reservations. This action cannot be undone.',
              )}
            </p>
          </div>
        </div>

        <label className="mt-5 block space-y-2">
          <span className="text-sm font-medium">
            {t('Type DELETE to confirm')}
          </span>
          <input
            className={inputClassName(false)}
            disabled={isDeleting}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </label>

        {errorMessage ? (
          <p
            className="text-destructive mt-4 rounded-md border border-current p-3 text-sm"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={isDeleting}
            type="button"
            variant="outline"
            onClick={onClose}
          >
            {t('Cancel')}
          </Button>
          <Button
            className="bg-destructive text-primary-foreground hover:bg-destructive/90"
            disabled={!isConfirmed || isDeleting}
            type="button"
            onClick={() => void handleDelete()}
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-4" aria-hidden="true" />
            )}
            {isDeleting ? t('Deleting...') : t('Delete account')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function inputClassName(hasError: boolean) {
  return cn(
    'border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-base outline-none focus-visible:ring-2',
    hasError && 'border-destructive focus-visible:ring-destructive',
  );
}

function FieldError({ message }: { message?: string }) {
  const { t } = useI18n();

  return message ? (
    <p className="text-destructive text-sm">{t(message)}</p>
  ) : null;
}

function formatCategory(value: string, t: (text: string) => string) {
  if (value === 'home') {
    return t('HomeCategory');
  }

  const label = value
    .replace('_', ' ')
    .replace(/^\w/, (letter) => letter.toUpperCase());

  return t(label);
}

function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language === 'ge' ? 'ka-GE' : 'en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}
