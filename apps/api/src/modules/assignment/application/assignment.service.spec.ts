import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentService } from './assignment.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AssignmentService', () => {
  let service: AssignmentService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      program: { findUnique: jest.fn() },
      advisorProgram: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), count: jest.fn() },
      opportunity: { findUnique: jest.fn(), update: jest.fn() },
      auditLog: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AssignmentService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AssignmentService>(AssignmentService);
  });

  it('should assign advisor to program', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'adv-1' });
    prisma.program.findUnique.mockResolvedValue({ id: 'prog-1' });
    prisma.advisorProgram.findUnique.mockResolvedValue(null);
    prisma.advisorProgram.count.mockResolvedValue(0);
    prisma.advisorProgram.create.mockResolvedValue({ id: 'ap-1', advisorId: 'adv-1', programId: 'prog-1' });

    const result = await service.assignAdvisorToProgram('adv-1', 'prog-1');
    expect(result.advisorId).toBe('adv-1');
  });

  it('should throw if advisor not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.assignAdvisorToProgram('bad', 'prog-1')).rejects.toThrow(NotFoundException);
  });

  it('should round-robin assign', async () => {
    prisma.advisorProgram.findMany.mockResolvedValue([
      { id: 'ap-1', advisorId: 'adv-1', cursor: 3 },
      { id: 'ap-2', advisorId: 'adv-2', cursor: 2 },
    ]);
    prisma.advisorProgram.update.mockResolvedValue({});

    const result = await service.roundRobinAssign('prog-1');
    expect(result).toBe('adv-2');
  });

  it('should return null if no advisors', async () => {
    prisma.advisorProgram.findMany.mockResolvedValue([]);
    const result = await service.roundRobinAssign('prog-1');
    expect(result).toBeNull();
  });
});
