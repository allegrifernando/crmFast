import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from './activity.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ActivityService', () => {
  let service: ActivityService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      opportunity: { findUnique: jest.fn() },
      activityEvent: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
  });

  it('should create activity', async () => {
    prisma.opportunity.findUnique.mockResolvedValue({ id: 'opp-1' });
    prisma.activityEvent.create.mockResolvedValue({
      id: 'act-1', opportunityId: 'opp-1', type: 'NOTE',
      description: 'Test note', actorId: 'usr-1', createdAt: new Date(),
    });

    const result = await service.create({
      opportunityId: 'opp-1', type: 'NOTE' as any,
      description: 'Test note', actorId: 'usr-1',
    });
    expect(result.id).toBe('act-1');
  });

  it('should throw if opportunity not found', async () => {
    prisma.opportunity.findUnique.mockResolvedValue(null);
    await expect(
      service.create({ opportunityId: 'bad', type: 'NOTE' as any, description: 'test', actorId: 'usr' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should find activities by opportunity', async () => {
    prisma.activityEvent.findMany.mockResolvedValue([{ id: 'act-1', type: 'NOTE' }]);
    prisma.activityEvent.count.mockResolvedValue(1);

    const result = await service.findByOpportunity('opp-1');
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should log stage change', async () => {
    prisma.activityEvent.create.mockResolvedValue({ id: 'act-1', type: 'STAGE_CHANGE' });
    const result = await service.logStageChange('opp-1', 'Nuevo', 'Interesado', 'usr-1');
    expect(result.type).toBe('STAGE_CHANGE');
  });
});
