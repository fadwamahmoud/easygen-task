jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PinoLogger } from 'nestjs-pino';

import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  const loggerMock = {
    setContext: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
  
    (argon2.hash as unknown as jest.Mock).mockReset();
    (argon2.verify as unknown as jest.Mock).mockReset();
  

    usersServiceMock.findByEmail.mockReset();
    usersServiceMock.create.mockReset();
    jwtServiceMock.signAsync.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: PinoLogger, useValue: loggerMock },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('signup', () => {
    it('creates user with hashed password and returns safe user', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);
      (argon2.hash as unknown as jest.Mock).mockResolvedValue('hashed');
      usersServiceMock.create.mockResolvedValue({
        _id: { toString: () => 'u1' },
        email: 'test@example.com',
        name: 'Tester',
        passwordHash: 'hashed',
      });

      const res = await service.signup({
        email: 'TEST@EXAMPLE.com',
        name: ' Tester ',
        password: 'Passw0rd!',
      });

      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(argon2.hash).toHaveBeenCalledWith('Passw0rd!');
      expect(usersServiceMock.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Tester',
        passwordHash: 'hashed',
      });

      expect(res).toEqual({
        id: 'u1',
        email: 'test@example.com',
        name: 'Tester',
      });
    });

    it('throws ConflictException if email already exists', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({ _id: 'existing' });

      await expect(
        service.signup({
          email: 'test@example.com',
          name: 'Tester',
          password: 'Passw0rd!',
        }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(usersServiceMock.create).not.toHaveBeenCalled();
      expect(argon2.hash).not.toHaveBeenCalled();
    });

    
  });

  describe('signin', () => {
    it('returns accessToken for valid credentials', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({
        _id: { toString: () => 'u1' },
        email: 'test@example.com',
        name: 'Tester',
        passwordHash: 'hashed',
      });
      (argon2.verify as unknown as jest.Mock).mockResolvedValue(true);
      jwtServiceMock.signAsync.mockResolvedValue('jwt-token');

      const res = await service.signin({
        email: 'TEST@example.com',
        password: 'Passw0rd!',
      });

      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(argon2.verify).toHaveBeenCalledWith('hashed', 'Passw0rd!');
      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: 'u1',
        email: 'test@example.com',
      });

      expect(res).toEqual({ accessToken: 'jwt-token' });
    });

    it('throws UnauthorizedException if user not found', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);

      await expect(
        service.signin({ email: 'missing@example.com', password: 'Passw0rd!' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(argon2.verify).not.toHaveBeenCalled();
      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException if password invalid', async () => {
      usersServiceMock.findByEmail.mockResolvedValue({
        _id: { toString: () => 'u1' },
        email: 'test@example.com',
        passwordHash: 'hashed',
      });
      (argon2.verify as unknown as jest.Mock).mockResolvedValue(false);

      await expect(
        service.signin({ email: 'test@example.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);

      expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
    });
  });
});