import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { JwtPayload } from './types/jwt-payload';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService,) { }

    async signup(dto: SignupDto) {
        const email = dto.email.toLowerCase().trim();

        const existing = await this.usersService.findByEmail(email);
        if (existing) {
            //application level duplicate check
            throw new ConflictException('Email already in use');
        }

        const passwordHash = await argon2.hash(dto.password);
        try {
            const user = await this.usersService.create({
                email,
                name: dto.name.trim(),
                passwordHash,
            });

            return {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
            };

        } catch (err: any) {
            if (err?.code === 11000) throw new ConflictException('Email already in use');
            throw err;
        }
    }
    async signin(dto: SigninDto) {
        const email = dto.email.toLowerCase().trim();

        const user = await this.usersService.findByEmail(email);
        if (!user) {
            // Don't leak if email exists
            throw new UnauthorizedException('Invalid credentials');
        }

        const ok = await argon2.verify(user.passwordHash, dto.password);
        if (!ok) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload: JwtPayload = {
            sub: user._id.toString(),
            email: user.email,
        };

        const accessToken = await this.jwtService.signAsync(payload);

        return { accessToken };
    }
}