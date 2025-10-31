import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({ message: 'Email must be valid' }).transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(128, { message: 'Password must be no longer than 128 characters' }),
  firstName: z
    .string()
    .trim()
    .min(1, { message: 'First name is required' })
    .max(100, { message: 'First name must be 100 characters or less' })
    .optional(),
  lastName: z
    .string()
    .trim()
    .min(1, { message: 'Last name is required' })
    .max(100, { message: 'Last name must be 100 characters or less' })
    .optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email must be valid' }).transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(128, { message: 'Password must be no longer than 128 characters' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
