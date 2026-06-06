import { z } from 'zod';

import { postCityOptions } from '../constants/post-options';

type PostCity = (typeof postCityOptions)[number];

const maxPhotoSize = 8 * 1024 * 1024;
const acceptedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp'];
const citySchema = z
  .string()
  .trim()
  .refine((city): city is PostCity => isPostCity(city), {
    message: 'Choose a city from the list.',
  });

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters.')
    .max(120, 'Title must be 120 characters or fewer.'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters.')
    .max(2000, 'Description must be 2000 characters or fewer.'),
  category: z.enum([
    'clothing',
    'home',
    'electronics',
    'books',
    'children',
    'sports',
    'other',
  ]),
  city: citySchema,
  photos: z
    .array(z.instanceof(File))
    .min(1, 'Add at least one photo.')
    .max(5, 'Add no more than 5 photos.')
    .refine(
      (photos) =>
        photos.every((photo) => acceptedPhotoTypes.includes(photo.type)),
      'Photos must be JPEG, PNG, or WebP files.',
    )
    .refine(
      (photos) => photos.every((photo) => photo.size <= maxPhotoSize),
      'Each photo must be 8 MB or smaller.',
    ),
});

export type CreatePostFormInput = z.input<typeof createPostSchema>;
export type CreatePostFormValues = z.output<typeof createPostSchema>;

function isPostCity(value: string): value is PostCity {
  return postCityOptions.includes(value as PostCity);
}
