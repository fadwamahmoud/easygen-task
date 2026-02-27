import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    signup: jest.fn(),
    signin: jest.fn(),
  };

  beforeEach(async () => {
    authServiceMock.signup.mockReset();
    authServiceMock.signin.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('signup calls AuthService.signup', async () => {
    authServiceMock.signup.mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      name: 'Tester',
    });

    const dto = {
      email: 'test@example.com',
      name: 'Tester',
      password: 'Passw0rd!',
    };
    const res = await controller.signup(dto as SignupDto);

    expect(authServiceMock.signup).toHaveBeenCalledWith(dto);
    expect(res).toEqual({
      id: 'u1',
      email: 'test@example.com',
      name: 'Tester',
    });
  });

  it('signin calls AuthService.signin', async () => {
    authServiceMock.signin.mockResolvedValue({ accessToken: 'jwt' });

    const dto = { email: 'test@example.com', password: 'Passw0rd!' };
    const res = await controller.signin(dto as SigninDto);

    expect(authServiceMock.signin).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ accessToken: 'jwt' });
  });
});
