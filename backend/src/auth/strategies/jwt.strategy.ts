import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import type { JwtPayload } from '../types/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    //passport-jwt’s Strategy options require a definite string
    //  (or a provider callback like secretOrKeyProvider). TypeScript is rejecting passing undefined into super(...).
    //  config.get() can still return undefined at type level
    //  getOrThrow returns a non optional value (or throws at startup)
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) throw new UnauthorizedException('Invalid token');

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };
  }
}
