import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('$2a$12$hashedpassword'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    password: '$2a$12$hashedpassword',
    name: 'Test User',
    role: { name: 'ADVISOR' },
    roleId: 'role-1',
    isActive: true,
    twoFactorEnabled: false,
    twoFactorSecret: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      session: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findMany: jest.fn(),
      },
      passwordResetToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-access-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should throw on invalid email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login('bad@email.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw on inactive user', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });
      await expect(service.login('test@test.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return tokens on valid credentials', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.session.create.mockResolvedValue({ id: 'session-1' });
      jest.mocked(require('bcryptjs').compare).mockResolvedValue(true);

      const result = await service.login('test@test.com', 'pass');

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe('test@test.com');
    });
  });

  describe('refreshToken', () => {
    it('should throw on invalid token', async () => {
      prisma.session.findUnique.mockResolvedValue(null);
      await expect(service.refreshToken('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw on revoked session', async () => {
      prisma.session.findUnique.mockResolvedValue({
        isRevoked: true,
        expiresAt: new Date(Date.now() + 3600000),
        user: mockUser,
      });
      await expect(service.refreshToken('revoked-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
