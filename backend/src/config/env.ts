import { envSchema, type EnvVars } from './env.schema';

export function validateEnv(config: Record<string, unknown>): EnvVars {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    // console.error('❌ Invalid environment variables', z.treeifyError(parsed.error).errors.join(" "));
    console.error(
      '❌ Invalid environment variables',
      parsed.error.flatten().fieldErrors,
    );
    throw new Error('Invalid environment variables');
  }
  return parsed.data;
}
