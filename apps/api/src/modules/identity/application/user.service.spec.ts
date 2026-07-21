import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let prisma: any;

  const mockRole = { id: 'role-1', name: 'ADVISOR', description: 'Advisor role' };
  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    name: 'Test',
    role: mockRole,
    roleId: 'role-1',
    isActive: true,
    twoFactorEnabled: false,
    createdAt: new Date(),
    password: '$2a$12$hash',
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      permission: {
        findMany: jest.fn(),
        deleteMany: jest.fn(),
        createMany: jest.fn(),
        findFirst: jest.fn(),
      },
      session: {
        updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('should throw on duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      await expect(
        service.create({ email: 'test@test.com', password: 'pass1234', name: 'Test', role: 'ADVISOR' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw on invalid role', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.role.findUnique.mockResolvedValue(null);
      await expect(
        service.create({ email: 'new@test.com', password: 'pass1234', name: 'New', role: 'ADVISOR' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create a user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.role.findUnique.mockResolvedValue(mockRole);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.create({
        email: 'new@test.com',
        password: 'pass1234',
        name: 'New',
        role: 'ADVISOR',
      });

      expect(result.email).toBe('test@test.com');
      expect(result.role).toBe('ADVISOR');
    });
  });

  describe('findById', () => {
    it('should throw if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('should return user if found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findById('user-1');
      expect(result.id).toBe('user-1');
    });
  });
});
