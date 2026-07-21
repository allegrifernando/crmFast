import { Test, TestingModule } from '@nestjs/testing';
import { CohortService } from './cohort.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CohortService', () => {
  let service: CohortService;
  let prisma: any;

  const mockProgram = { id: 'prog-1', name: 'Programa', code: 'P', isActive: true };
  const mockCohort = {
    id: 'coh-1',
    name: '2026-A',
    programId: 'prog-1',
    startDate: new Date('2026-03-01'),
    endDate: null,
    enrollmentStartDate: null,
    enrollmentEndDate: null,
    quota: 30,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    program: mockProgram,
  };

  beforeEach(async () => {
    prisma = {
      cohort: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      program: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CohortService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CohortService>(CohortService);
  });

  it('should create a cohort', async () => {
    prisma.program.findUnique.mockResolvedValue(mockProgram);
    prisma.cohort.create.mockResolvedValue(mockCohort);

    const result = await service.create({
      name: '2026-A',
      programId: 'prog-1',
      startDate: '2026-03-01',
      quota: 30,
    });
    expect(result.name).toBe('2026-A');
  });

  it('should throw if program not found', async () => {
    prisma.program.findUnique.mockResolvedValue(null);
    await expect(
      service.create({ name: '2026-A', programId: 'bad', startDate: '2026-03-01' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should find cohorts by program', async () => {
    prisma.cohort.findMany.mockResolvedValue([mockCohort]);
    const result = await service.findByProgram('prog-1');
    expect(result).toHaveLength(1);
  });

  it('should throw on not found', async () => {
    prisma.cohort.findUnique.mockResolvedValue(null);
    await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
  });
});
