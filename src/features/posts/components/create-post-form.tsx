import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import type { FeedPage } from '@/features/feed/api/feed-api';
import { useAuth } from '@/features/auth/context/use-auth';
import { Button } from '@/shared/components/ui/button';
import { useI18n } from '@/shared/i18n/i18n';
import { cn } from '@/shared/lib/cn';

import { createPost } from '../api/create-post-api';
import {
  postCategoryOptions,
  postCityOptions,
} from '../constants/post-options';
import { compressImage } from '../utils/compress-image';
import {
  type CreatePostFormInput,
  createPostSchema,
  type CreatePostFormValues,
} from '../validation/create-post-schema';

type PhotoPreview = {
  file: File;
  url: string;
};

export function CreatePostForm() {
  const { user } = useAuth();
  const { localizedPath, t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreview[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    formState: { errors },
    handleSubmit,
    control,
    register,
    setValue,
  } = useForm<CreatePostFormInput, unknown, CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'other',
      city: 'Tbilisi',
      photos: [],
    },
  });

  const photos = useWatch({ control, name: 'photos' });

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: (post) => {
      queryClient.setQueriesData<{ pages: FeedPage[]; pageParams: number[] }>(
        { queryKey: ['feed'] },
        (current) => {
          if (!current?.pages[0]) {
            return current;
          }

          return {
            ...current,
            pages: [
              {
                ...current.pages[0],
                items: [post, ...current.pages[0].items],
              },
              ...current.pages.slice(1),
            ],
          };
        },
      );
      void queryClient.invalidateQueries({ queryKey: ['feed'] });
      navigate(localizedPath('/'), { replace: true });
    },
    onError: (error) => {
      setFormError(
        error instanceof Error
          ? error.message
          : t('Post could not be created.'),
      );
    },
  });

  useEffect(() => {
    return () => {
      photoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [photoPreviews]);

  const isSubmitting = mutation.isPending;
  const photoError = errors.photos?.message;
  const remainingPhotoSlots = useMemo(
    () => Math.max(0, 5 - photos.length),
    [photos.length],
  );

  async function handlePhotoSelection(files: FileList | null) {
    setFormError(null);

    if (!files) {
      return;
    }

    const selectedFiles = Array.from(files).slice(0, remainingPhotoSlots);

    try {
      const compressedPhotos = await Promise.all(
        selectedFiles.map((file) => compressImage(file)),
      );
      const nextPhotos = [...photos, ...compressedPhotos];

      photoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
      setValue('photos', nextPhotos, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setPhotoPreviews(
        nextPhotos.map((file) => ({ file, url: URL.createObjectURL(file) })),
      );
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : t('Photos could not be processed.'),
      );
    }
  }

  function removePhoto(index: number) {
    const nextPhotos = photos.filter((_, photoIndex) => photoIndex !== index);

    photoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    setValue('photos', nextPhotos, { shouldDirty: true, shouldValidate: true });
    setPhotoPreviews(
      nextPhotos.map((file) => ({ file, url: URL.createObjectURL(file) })),
    );
  }

  function onSubmit(values: CreatePostFormValues) {
    setFormError(null);

    if (!user) {
      setFormError(t('You must be logged in to create a post.'));
      return;
    }

    mutation.mutate({
      ...values,
      ownerId: user.id,
    });
  }

  return (
    <form
      className="bg-card space-y-5 rounded-lg border p-5 shadow-sm"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="title">
          {t('Title')}
        </label>
        <input
          aria-invalid={Boolean(errors.title)}
          className={inputClassName(Boolean(errors.title))}
          id="title"
          type="text"
          {...register('title')}
        />
        {errors.title ? (
          <FieldError message={t(errors.title.message ?? '')} />
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="description">
          {t('Description')}
        </label>
        <textarea
          aria-invalid={Boolean(errors.description)}
          className={cn(
            inputClassName(Boolean(errors.description)),
            'min-h-32 resize-y py-3',
          )}
          id="description"
          {...register('description')}
        />
        {errors.description ? (
          <FieldError message={t(errors.description.message ?? '')} />
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium">{t('Category')}</span>
          <select
            className={inputClassName(Boolean(errors.category))}
            {...register('category')}
          >
            {postCategoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.label)}
              </option>
            ))}
          </select>
          {errors.category ? (
            <FieldError message={t(errors.category.message ?? '')} />
          ) : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">{t('City')}</span>
          <input
            className={inputClassName(Boolean(errors.city))}
            list="create-post-city-options"
            placeholder={t('Search city')}
            type="search"
            {...register('city')}
          />
          <datalist id="create-post-city-options">
            {postCityOptions.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
          {errors.city ? (
            <FieldError message={t(errors.city.message ?? '')} />
          ) : null}
        </label>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium">{t('Photos')}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {t('Add 1 to 5 photos. Images are compressed before upload.')}
          </p>
        </div>

        {photoPreviews.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {photoPreviews.map((preview, index) => (
              <div
                className="group relative overflow-hidden rounded-lg border"
                key={preview.url}
              >
                <img
                  className="aspect-square w-full object-cover"
                  src={preview.url}
                  alt=""
                />
                <Button
                  aria-label={`${t('Remove photo')} ${index + 1}`}
                  className="absolute top-2 right-2 size-9 p-0"
                  type="button"
                  variant="outline"
                  onClick={() => removePhoto(index)}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            ))}
          </div>
        ) : null}

        {remainingPhotoSlots > 0 ? (
          <label className="border-input bg-background hover:bg-accent flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-center transition-colors">
            <ImagePlus
              className="text-muted-foreground size-6"
              aria-hidden="true"
            />
            <span className="text-sm font-medium">{t('Choose photos')}</span>
            <span className="text-muted-foreground text-xs">
              {remainingPhotoSlots} {t('slots left')}
            </span>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              multiple
              type="file"
              onChange={(event) =>
                void handlePhotoSelection(event.target.files)
              }
            />
          </label>
        ) : null}

        {photoError ? <FieldError message={t(photoError)} /> : null}
      </div>

      {formError ? (
        <p
          className="text-destructive rounded-md border border-current p-3 text-sm"
          role="alert"
        >
          {t(formError)}
        </p>
      ) : null}

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? t('Creating post...') : t('Create post')}
      </Button>
    </form>
  );
}

function inputClassName(hasError: boolean) {
  return cn(
    'border-input bg-background focus-visible:ring-ring h-11 w-full rounded-md border px-3 text-base outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
    hasError && 'border-destructive focus-visible:ring-destructive',
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-destructive text-sm">{message}</p>;
}
