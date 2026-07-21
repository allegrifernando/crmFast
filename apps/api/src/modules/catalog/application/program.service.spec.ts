import { Test, TestingModule } from '@nestjs/testing';
import { ProgramService } from './program.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Modality } from '@prisma/client';

describe('ProgramService', () => {
  let service: ProgramService;
  let prisma: any;

  const mockFaculty = { id: 'fac-1', name: 'Facultad', code: 'FAC', isActive: true };
  const mockProgram = {
    id: 'prog-1',
    name: 'Ingeniería de Sistemas',
    code: 'IS',
    facultyId: 'fac-1',
    modality: Modality.VIRTUAL,
    price: 5000,
    hasScholarship: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    faculty: mockFaculty,
    cohorts: [],
  };

  beforeEach(async () => {
    prisma = {
      program: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      faculty: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgramService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ProgramService>(ProgramService);
  });

  it('should create a program', async () => {
    prisma.faculty.findUnique.mockResolvedValue(mockFaculty);
    prisma.program.findUnique.mockResolvedValue(null);
    prisma.program.create.mockResolvedValue(mockProgram);

    const result = await service.create({
      name: 'Ingeniería de Sistemas',
      code: 'IS',
      facultyId: 'fac-1',
      modality: Modality.VIRTUAL,
    });
    expect(result.name).toBe('Ingeniería de Sistemas');
  });

  it('should throw if faculty not found', async () => {
    prisma.faculty.findUnique.mockResolvedValue(null);
    await expect(
      service.create({ name: 'Test', code: 'T', facultyId: 'bad', modality: Modality.VIRTUAL }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw on duplicate code', async () => {
    prisma.faculty.findUnique.mockResolvedValue(mockFaculty);
    prisma.program.findUnique.mockResolvedValue(mockProgram);
    await expect(
      service.create({ name: 'Test', code: 'IS', facultyId: 'fac-1', modality: Modality.VIRTUAL }),
    ).rejects.toThrow(ConflictException);
  });

  it('should find all programs with filters', async () => {
    prisma.program.findMany.mockResolvedValue([mockProgram]);
    const result = await service.findAll({ modality: Modality.VIRTUAL });
    expect(result).toHaveLength(1);
  });
});
