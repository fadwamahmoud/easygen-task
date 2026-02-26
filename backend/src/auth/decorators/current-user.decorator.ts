import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestUser } from '../types/request-user';

// This avoids littering controllers with req.user as any.
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): RequestUser => {
    const req = ctx.switchToHttp().getRequest<{ user: RequestUser }>();
    return req.user;
  },
);
