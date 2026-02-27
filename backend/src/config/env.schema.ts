import { z } from 'zod';

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().default(3001),
    // mongouri is required when non test env
    MONGO_URI: z.string().optional(),

    JWT_ACCESS_SECRET: z.string().min(16),
    JWT_ACCESS_TTL: z.string().default('15m'),

    CORS_ORIGIN: z.string().min(1),
  })
  .superRefine((val, ctx) => {
    if (val.NODE_ENV !== 'test' && !val.MONGO_URI) {
      ctx.addIssue({
        code: 'custom',
        path: ['MONGO_URI'],
        message: 'MONGO_URI is required',
      });
    }
  });

export type EnvVars = z.infer<typeof envSchema>;
