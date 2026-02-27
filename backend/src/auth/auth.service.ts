import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { JwtPayload } from './types/jwt-payload';
import { JwtService } from '@nestjs/jwt';
import { MongoServerError } from 'mongodb';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(AuthService.name);
  }

  async signup(dto: SignupDto) {
    const email = dto.email.toLowerCase().trim();

    const existing = await this.usersService.findByEmail(email);
    this.logger.info({ email }, 'Signup attempt');
    if (existing) {
      //application level duplicate check
      this.logger.warn({ email }, 'Signup failed: email already in use');
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await argon2.hash(dto.password);
    try {
      const user = await this.usersService.create({
        email,
        name: dto.name.trim(),
        passwordHash,
      });
      this.logger.info(
        { userId: user._id.toString(), email },
        'Signup success',
      );

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      };
    } catch (err: unknown) {
      if (err instanceof MongoServerError && err.code && err.code === 11000)
        throw new ConflictException('Email already in use');
      throw err;
    }
  }
  async signin(dto: SigninDto) {
    const email = dto.email.toLowerCase().trim();

    const user = await this.usersService.findByEmail(email);
    this.logger.info({ email }, 'Signin attempt');
    if (!user) {
      this.logger.warn({ email }, 'Signin failed: invalid credentials');
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await argon2.verify(user.passwordHash, dto.password);
    if (!ok) {
      this.logger.warn(
        { email, userId: user._id.toString() },
        'Signin failed: invalid credentials',
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.info({ email, userId: user._id.toString() }, 'Signin success');

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}
