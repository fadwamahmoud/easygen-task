import { z } from 'zod';

// prevent BE/FE validation mismatch
export const passwordPolicy =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;

export const signupSchema = z.object({
  email: z.email('Invalid email'),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  password: z
    .string()
    .regex(
      passwordPolicy,
      'Password must be at least 8 characters and include at least one letter, one number, and one special character.',
    ),
});

export const signinSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export type SignupValues = z.infer<typeof signupSchema>;
export type SigninValues = z.infer<typeof signinSchema>;