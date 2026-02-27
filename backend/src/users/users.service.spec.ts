import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { User } from './user.schema';

describe('UsersService', () => {
  let service: UsersService;

  const modelMock = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    modelMock.findOne.mockReset();
    modelMock.create.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: modelMock },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findByEmail lowercases the email and calls exec()', async () => {
    const exec = jest.fn().mockResolvedValue(null);
    modelMock.findOne.mockReturnValue({ exec });

    await service.findByEmail('TEST@Example.com');

    expect(modelMock.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(exec).toHaveBeenCalled();
  });

  it('create normalizes email to lowercase', async () => {
    modelMock.create.mockResolvedValue({
      _id: 'u1',
      email: 'test@example.com',
      name: 'Tester',
      passwordHash: 'hash',
    });

    await service.create({
      email: 'TEST@Example.com',
      name: 'Tester',
      passwordHash: 'hash',
    });

    expect(modelMock.create).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'Tester',
      passwordHash: 'hash',
    });
  });
});