import { ConflictException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) { }

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
}