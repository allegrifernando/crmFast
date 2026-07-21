import { Test, TestingModule } from '@nestjs/testing';
import { FacultyService } from './faculty.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('FacultyService', () => {
  let service: FacultyService;
  let prisma: any;

  const mockFaculty = {
    id: 'fac-1',
    name: 'Facultad de Ingeniería',
    code: 'FI',
    description: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    programs: [],
  };

  beforeEach(async () => {
    prisma = {
      faculty: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FacultyService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<FacultyService>(FacultyService);
  });

  it('should create a faculty', async () => {
    prisma.faculty.findUnique.mockResolvedValue(null);
    prisma.faculty.create.mockResolvedValue(mockFaculty);

    const result = await service.create({ name: 'Facultad de Ingeniería', code: 'FI' });
    expect(result.name).toBe('Facultad de Ingeniería');
  });

  it('should throw on duplicate code', async () => {
    prisma.faculty.findUnique.mockResolvedValue(mockFaculty);
    await expect(service.create({ name: 'Otra', code: 'FI' })).rejects.toThrow(ConflictException);
  });

  it('should find all active faculties', async () => {
    prisma.faculty.findMany.mockResolvedValue([mockFaculty]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('should throw on not found', async () => {
    prisma.faculty.findUnique.mockResolvedValue(null);
    await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
  });
});
