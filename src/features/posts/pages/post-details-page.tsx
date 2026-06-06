import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CalendarDays,
  FileWarning,
  ImageIcon,
  MapPin,
  Pencil,
  X,
  Trash2,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { z } from 'zod';

import { useAuth } from '@/features/auth/context/use-auth';
import { StatusBadge } from '@/features/feed/components/status-badge';
import { EmptyState } from '@/shared/components/empty-state';
import { LoadingState } from '@/shared/components/loading-state';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import { PageContainer } from '@/shared/layouts/page-container';

import {
  createPostReport,
  cancelReservation,
  deletePost,
  fetchPostDetails,
  markPostGiven,
  reservePost,
  updatePostDetails,
} from '../api/post-details-api';
import {
  postCategoryOptions,
  postCityOptions,
} from '../constants/post-options';
import { ReservationCountdown } from '../components/reservation-countdown';
import { createPostSchema } from '../validation/create-post-schema';

const editPostSchema = createPostSchema.omit({ photos: true });
type EditPostInput = z.input<typeof editPostSchema>;
type EditPostValues = z.output<typeof editPostSchema>;

export function PostDetailsPage() {
  const { postId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { language, localizedPath, t } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isEditingManually, setIsEditingManually] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: post,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPostDetails(postId ?? ''),
    enabled: Boolean(postId),
  });

  const editForm = useForm<EditPostInput, unknown, EditPostValues>({
    resolver: zodResolver(editPostSchema),
    values: post
      ? {
          title: post.title,
          description: post.description,
          category: post.category,
          city: normalizeCity(post.location),
        }
      : undefined,
  });

  const reserveMutation = useMutation({
    mutationFn: async () => {
      if (!post || !user) {
        throw new Error(t('Log in to reserve this item.'));
      }

      await reservePost(post.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
      setActionError(null);
    },
    onError: (mutationError) => {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : t('Could not reserve item.'),
      );
    },
  });

  const cancelReservationMutation = useMutation({
    mutationFn: async () => {
      if (!post?.activeReservation) {
        throw new Error(t('Reservation was not found.'));
      }

      await cancelReservation(post.activeReservation.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
      await queryClient.invalidateQueries({ queryKey: ['reserved-items'] });
      setActionError(null);
    },
    onError: (mutationError) => {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : t('Could not cancel reservation.'),
      );
    },
  });

  const markGivenMutation = useMutation({
    mutationFn: async () => {
      if (!post) {
        throw new Error(t('Post was not found.'));
      }

      await markPostGiven(post.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
      await queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      setActionError(null);
    },
    onError: (mutationError) => {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : t('Could not mark item as given.'),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!post) {
        throw new Error(t('Post was not found.'));
      }

      await deletePost(post);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
      navigate(localizedPath('/'), { replace: true });
    },
    onError: (mutationError) => {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : t('Could not delete item.'),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: EditPostValues) => {
      if (!post) {
        throw new Error(t('Post was not found.'));
      }

      return updatePostDetails(post.id, values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });
      await queryClient.invalidateQueries({ queryKey: ['feed'] });
      setIsEditingManually(false);
      setSearchParams({}, { replace: true });
      setActionError(null);
    },
    onError: (mutationError) => {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : t('Could not update item.'),
      );
    },
  });

  const reportMutation = useMutation({
    mutationFn: (values: { body: string; subject: string }) => {
      if (!post || !user) {
        throw new Error(t('Log in to report this item.'));
      }

      return createPostReport({
        body: values.body,
        postId: post.id,
        reporterId: user.id,
        subject: values.subject,
      });
    },
    onSuccess: () => {
      setIsReportOpen(false);
      setActionError(null);
    },
    onError: (mutationError) => {
      setActionError(
        mutationError instanceof Error
          ? mutationError.message
          : t('Could not submit report.'),
      );
    },
  });

  if (!postId) {
    return <Navigate replace to={localizedPath('/')} />;
  }

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState
          title={t('Loading item')}
          description={t('Gaachuqe is loading item details.')}
          variant="details"
        />
      </PageContainer>
    );
  }

  if (isError || !post) {
    return (
      <PageContainer>
        <EmptyState
          title={t('Item not found')}
          description={
            error instanceof Error
              ? error.message
              : t('This item could not be loaded.')
          }
        />
      </PageContainer>
    );
  }

  const isOwner = user?.id === post.ownerId;
  const isEditing =
    isOwner && (isEditingManually || searchParams.get('edit') === '1');
  const activeImage = post.images[activeImageIndex];

  return (
    <PageContainer className="gap-6">
      <Button asChild className="w-fit" variant="outline">
        <Link to={localizedPath('/')}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t('Back')}
        </Link>
      </Button>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-3">
          <div className="bg-muted flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border">
            {activeImage?.url ? (
              <button
                aria-label="Open full image"
                className="focus-visible:ring-ring h-full w-full cursor-zoom-in focus-visible:ring-2 focus-visible:outline-none"
                type="button"
                onClick={() => setIsImageViewerOpen(true)}
              >
                <img
                  className="h-full w-full object-cover"
                  src={activeImage.url}
                  alt=""
                />
              </button>
            ) : (
              <ImageIcon
                className="text-muted-foreground size-12"
                aria-hidden="true"
              />
            )}
          </div>

          {post.images.length > 1 ? (
            <div className="grid grid-cols-5 gap-2">
              {post.images.map((image, index) => (
                <button
                  aria-label={`Show image ${index + 1}`}
                  className="focus-visible:ring-ring overflow-hidden rounded-md border focus-visible:ring-2"
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                >
                  {image.url ? (
                    <img
                      className="aspect-square w-full object-cover"
                      src={image.url}
                      alt=""
                    />
                  ) : (
                    <span className="bg-muted flex aspect-square items-center justify-center">
                      <ImageIcon
                        className="text-muted-foreground size-5"
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="bg-card space-y-5 rounded-lg border p-5 shadow-sm">
          {isEditing ? (
            <form
              className="space-y-4"
              onSubmit={editForm.handleSubmit((values) =>
                updateMutation.mutate(values),
              )}
            >
              <EditField
                error={editForm.formState.errors.title?.message}
                label={t('Title')}
                registration={editForm.register('title')}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="description">
                  {t('Description')}
                </label>
                <textarea
                  className="border-input bg-background focus-visible:ring-ring min-h-32 w-full rounded-md border px-3 py-3 text-base outline-none focus-visible:ring-2"
                  id="description"
                  {...editForm.register('description')}
                />
                <FieldError
                  message={editForm.formState.errors.description?.message}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium">{t('Category')}</span>
                  <select
                    className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-base outline-none focus-visible:ring-2"
                    {...editForm.register('category')}
                  >
                    {postCategoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.label)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">{t('City')}</span>
                  <input
                    className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-base outline-none focus-visible:ring-2"
                    list="edit-post-city-options"
                    placeholder={t('Search city')}
                    type="search"
                    {...editForm.register('city')}
                  />
                  <datalist id="edit-post-city-options">
                    {postCityOptions.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                  <FieldError
                    message={editForm.formState.errors.city?.message}
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <Button disabled={updateMutation.isPending} type="submit">
                  {updateMutation.isPending ? t('Saving...') : t('Save')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditingManually(false);
                    setSearchParams({}, { replace: true });
                  }}
                >
                  {t('Cancel')}
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                  <h1 className="min-w-0 flex-1 break-words [overflow-wrap:anywhere] text-3xl leading-tight font-semibold">
                    {post.title}
                  </h1>
                  <StatusBadge status={post.status} />
                </div>
                <p className="text-muted-foreground break-words whitespace-pre-line [overflow-wrap:anywhere] leading-7">
                  {post.description}
                </p>
              </div>

              <dl className="grid gap-3 text-sm">
                <DetailRow
                  label={t('Category')}
                  value={formatCategory(post.category, t)}
                />
                <DetailRow
                  label={t('City')}
                  value={t(post.location)}
                  icon={<MapPin className="size-4" />}
                />
                <DetailRow
                  label={t('Date')}
                  value={formatDate(post.createdAt, language)}
                  icon={<CalendarDays className="size-4" />}
                />
                <DetailRow
                  label={t('Expires')}
                  value={formatDate(post.expiresAt, language)}
                  icon={<CalendarDays className="size-4" />}
                />
              </dl>

              {post.activeReservation ? (
                <ReservationCountdown
                  expiresAt={post.activeReservation.expiresAt}
                />
              ) : null}

              <section className="rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-muted flex size-10 items-center justify-center overflow-hidden rounded-md">
                    {post.owner?.avatarUrl ? (
                      <img
                        className="h-full w-full object-cover"
                        src={post.owner.avatarUrl}
                        alt=""
                      />
                    ) : (
                      <User
                        className="text-muted-foreground size-5"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      {post.owner?.displayName ?? t('Gaachuqe member')}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {post.owner?.location
                        ? t(post.owner.location)
                        : t('Owner information is limited')}
                    </p>
                  </div>
                </div>
              </section>

              {!isOwner &&
              post.activeReservation?.requesterId === user?.id &&
              post.owner?.phoneNumber ? (
                <section className="border-primary/30 bg-primary/5 rounded-lg border p-4">
                  <h2 className="font-semibold">{t('Reservation active')}</h2>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    {t('Contact the owner to arrange pickup.')}
                  </p>
                  <Button asChild className="mt-3 w-full">
                    <a href={`tel:${post.owner.phoneNumber}`}>
                      {t('Call')} {post.owner.phoneNumber}
                    </a>
                  </Button>
                </section>
              ) : null}

              {actionError ? (
                <p
                  className="text-destructive rounded-md border border-current p-3 text-sm"
                  role="alert"
                >
                  {actionError}
                </p>
              ) : null}

              {isOwner ? (
                <div className="grid gap-2">
                  <Button
                    className="h-auto min-h-11 w-full whitespace-normal"
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditingManually(true);
                      setSearchParams({ edit: '1' }, { replace: true });
                    }}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                    {t('Edit')}
                  </Button>
                  <Button
                    className="h-auto min-h-11 w-full whitespace-normal"
                    disabled={
                      post.status === 'given' || markGivenMutation.isPending
                    }
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (
                        window.confirm(
                          t(
                            'Mark this item as given? Active reservations will be completed.',
                          ),
                        )
                      ) {
                        markGivenMutation.mutate();
                      }
                    }}
                  >
                    {markGivenMutation.isPending
                      ? t('Saving...')
                      : post.status === 'given'
                        ? t('Given')
                        : t('Mark given')}
                  </Button>
                  <Button
                    className="h-auto min-h-11 w-full whitespace-normal"
                    disabled={deleteMutation.isPending}
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (
                        window.confirm(
                          t(
                            'Delete this post permanently? This cannot be undone.',
                          ),
                        )
                      ) {
                        deleteMutation.mutate();
                      }
                    }}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    {deleteMutation.isPending ? t('Deleting...') : t('Delete')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <VisitorAction
                    disabled={
                      post.status !== 'available' || reserveMutation.isPending
                    }
                    isAuthenticated={isAuthenticated}
                    isPending={reserveMutation.isPending}
                    isReservedByViewer={
                      post.activeReservation?.requesterId === user?.id
                    }
                    isCancelling={cancelReservationMutation.isPending}
                    onCancel={() => {
                      if (
                        window.confirm(
                          t('Cancel your reservation for this item?'),
                        )
                      ) {
                        cancelReservationMutation.mutate();
                      }
                    }}
                    onReserve={() => {
                      if (
                        window.confirm(
                          t('Reserve this item? The owner will be notified.'),
                        )
                      ) {
                        reserveMutation.mutate();
                      }
                    }}
                  />
                  {isAuthenticated ? (
                    <Button
                      className="w-full"
                      type="button"
                      variant="outline"
                      onClick={() => setIsReportOpen(true)}
                    >
                      <FileWarning className="size-4" aria-hidden="true" />
                      {t('Report')}
                    </Button>
                  ) : null}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {isReportOpen ? (
        <ReportPostModal
          isSubmitting={reportMutation.isPending}
          onClose={() => setIsReportOpen(false)}
          onSubmit={(values) => reportMutation.mutate(values)}
        />
      ) : null}

      {isImageViewerOpen && activeImage?.url ? (
        <ImageViewerModal
          imageUrl={activeImage.url}
          title={post.title}
          onClose={() => setIsImageViewerOpen(false)}
        />
      ) : null}
    </PageContainer>
  );
}

function ImageViewerModal({
  imageUrl,
  onClose,
  title,
}: {
  imageUrl: string;
  onClose: () => void;
  title: string;
}) {
  return (
    <div
      aria-label="Full image viewer"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3"
      role="dialog"
      onClick={onClose}
    >
      <button
        aria-label="Close image"
        className="focus-visible:ring-ring absolute top-3 right-3 flex size-10 items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:outline-none"
        type="button"
        onClick={onClose}
      >
        <X className="size-5" aria-hidden="true" />
      </button>
      <img
        className="max-h-full max-w-full object-contain"
        src={imageUrl}
        alt={title}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4 rounded-md border p-3">
      <dt className="text-muted-foreground flex min-w-0 items-center gap-2">
        {icon}
        <span className="break-words">{label}</span>
      </dt>
      <dd className="min-w-0 text-right font-medium break-words">{value}</dd>
    </div>
  );
}

function VisitorAction({
  disabled,
  isAuthenticated,
  isCancelling,
  isPending,
  isReservedByViewer,
  onCancel,
  onReserve,
}: {
  disabled: boolean;
  isAuthenticated: boolean;
  isCancelling: boolean;
  isPending: boolean;
  isReservedByViewer: boolean;
  onCancel: () => void;
  onReserve: () => void;
}) {
  const { localizedPath, t } = useI18n();

  if (!isAuthenticated) {
    return (
      <Button asChild className="w-full">
        <Link to={localizedPath('/login')}>{t('Log in to reserve')}</Link>
      </Button>
    );
  }

  if (isReservedByViewer) {
    return (
      <Button
        className="w-full"
        disabled={isCancelling}
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        {isCancelling ? t('Cancelling...') : t('Unreserve')}
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      disabled={disabled}
      type="button"
      onClick={onReserve}
    >
      {isPending ? t('Reserving...') : t('Reserve')}
    </Button>
  );
}

function ReportPostModal({
  isSubmitting,
  onClose,
  onSubmit,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: { body: string; subject: string }) => void;
}) {
  const { t } = useI18n();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const canSubmit =
    subject.trim().length >= 2 &&
    subject.trim().length <= 120 &&
    body.trim().length >= 2 &&
    body.trim().length <= 1000;

  return (
    <div
      aria-labelledby="report-post-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
    >
      <div className="bg-card w-full max-w-md rounded-lg border p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="bg-destructive/10 text-destructive flex size-10 shrink-0 items-center justify-center rounded-md">
            <FileWarning className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold" id="report-post-title">
              {t('Report item')}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              {t(
                'Reports are reviewed by admins and help keep the marketplace safe.',
              )}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-medium">{t('Subject')}</span>
            <input
              className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-base outline-none focus-visible:ring-2"
              disabled={isSubmitting}
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">{t('Details')}</span>
            <textarea
              className="border-input bg-background focus-visible:ring-ring min-h-28 w-full rounded-md border px-3 py-3 text-base outline-none focus-visible:ring-2"
              disabled={isSubmitting}
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={isSubmitting}
            type="button"
            variant="outline"
            onClick={onClose}
          >
            {t('Cancel')}
          </Button>
          <Button
            disabled={!canSubmit || isSubmitting}
            type="button"
            onClick={() =>
              onSubmit({ body: body.trim(), subject: subject.trim() })
            }
          >
            {isSubmitting ? t('Submitting...') : t('Submit report')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function EditField({
  error,
  label,
  registration,
}: {
  error?: string;
  label: string;
  registration: UseFormRegisterReturn;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" htmlFor={registration.name}>
        {label}
      </label>
      <input
        className="border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-base outline-none focus-visible:ring-2"
        id={registration.name}
        type="text"
        {...registration}
      />
      <FieldError message={t(error ?? '')} />
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-destructive text-sm">{message}</p>;
}

function formatDate(value: string, language: string) {
  if (language === 'ge') {
    const date = new Date(value);
    const months = [
      'იანვარი',
      'თებერვალი',
      'მარტი',
      'აპრილი',
      'მაისი',
      'ივნისი',
      'ივლისი',
      'აგვისტო',
      'სექტემბერი',
      'ოქტომბერი',
      'ნოემბერი',
      'დეკემბერი',
    ];

    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  }

  return new Intl.DateTimeFormat(language === 'ge' ? 'ka-GE' : 'en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
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

function normalizeCity(value: string): EditPostValues['city'] {
  return postCityOptions.includes(value as EditPostValues['city'])
    ? (value as EditPostValues['city'])
    : 'Tbilisi';
}
