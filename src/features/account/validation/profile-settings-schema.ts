import { z } from 'zod';

import { normalizeGeorgianPhoneNumber } from '@/features/auth/utils/georgian-phone-number';

export const profileSettingsSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'Display name must be at least 2 characters.')
    .max(80, 'Display name must be 80 characters or fewer.'),
  phoneNumber: z.string().refine(
    (value) => /^\+9955\d{8}$/.test(normalizeGeorgianPhoneNumber(value)),
    'Enter a Georgian mobile number like (+995) 555 12 34 56.',
  ),
  location: z
    .string()
    .trim()
    .min(2, 'Location must be at least 2 characters.')
    .max(120, 'Location must be 120 characters or fewer.'),
});

export type ProfileSettingsValues = z.infer<typeof profileSettingsSchema>;
