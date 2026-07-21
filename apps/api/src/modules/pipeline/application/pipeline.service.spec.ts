import { Test, TestingModule } from '@nestjs/testing';
import { PipelineService } from './pipeline.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('PipelineService', () => {
  let service: PipelineService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      pipelineStage: {
        findUnique: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(),
        create: jest.fn(), update: jest.fn(), delete: jest.fn(),
        createMany: jest.fn(), count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PipelineService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
  });

  it('should create a stage', async () => {
    prisma.pipelineStage.create.mockResolvedValue({ id: 's-1', name: 'Nuevo', order: 0, type: 'NORMAL' });
    const result = await service.create({ name: 'Nuevo', order: 0 });
    expect(result.name).toBe('Nuevo');
  });

  it('should throw on renaming terminal stage', async () => {
    prisma.pipelineStage.findUnique.mockResolvedValue({ id: 's-1', name: 'Matriculado', order: 9, type: 'TERMINAL_ENROLLED' });
    await expect(service.update('s-1', { name: 'NuevoNombre' })).rejects.toThrow(BadRequestException);
  });

  it('should find all active stages', async () => {
    prisma.pipelineStage.findMany.mockResolvedValue([{ id: 's-1', name: 'Nuevo' }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('should seed default stages when empty', async () => {
    prisma.pipelineStage.count.mockResolvedValue(0);
    prisma.pipelineStage.createMany.mockResolvedValue({ count: 12 });
    await service.seedDefaultStages();
    expect(prisma.pipelineStage.createMany).toHaveBeenCalled();
  });
});
