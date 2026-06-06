import { z } from 'zod';

import { normalizeGeorgianPhoneNumber } from '../utils/georgian-phone-number';

const nameSchema = z
  .string()
  .trim()
  .min(2, 'Must be at least 2 characters.')
  .max(50, 'Must be 50 characters or fewer.');

const emailSchema = z
  .string()
  .trim()
  .email('Enter a valid email address.')
  .max(254, 'Email must be 254 characters or fewer.');

const phoneNumberSchema = z.string().refine(
  (value) => /^\+9955\d{8}$/.test(normalizeGeorgianPhoneNumber(value)),
  'Enter a Georgian mobile number like (+995) 555 12 34 56.',
);

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be 72 characters or fewer.');

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phoneNumber: phoneNumberSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
