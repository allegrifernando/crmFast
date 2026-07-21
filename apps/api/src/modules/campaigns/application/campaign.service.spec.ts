import { Test, TestingModule } from '@nestjs/testing';
import { CampaignService } from './campaign.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CampaignService', () => {
  let service: CampaignService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      campaign: {
        create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(),
        update: jest.fn(), delete: jest.fn(),
      },
      opportunity: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CampaignService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CampaignService>(CampaignService);
  });

  it('should create campaign', async () => {
    prisma.campaign.create.mockResolvedValue({ id: 'c-1', name: 'Summer Campaign', cost: 5000 });
    const result = await service.create({ name: 'Summer Campaign', cost: 5000, startDate: '2026-06-01' });
    expect(result.name).toBe('Summer Campaign');
  });

  it('should throw on update not found', async () => {
    prisma.campaign.findUnique.mockResolvedValue(null);
    await expect(service.update('bad', { name: 'Test' })).rejects.toThrow(NotFoundException);
  });

  it('should calculate metrics', async () => {
    prisma.campaign.findMany.mockResolvedValue([
      { id: 'c-1', name: 'Campaign A', cost: 10000, opportunities: [
        { isEnrolled: false }, { isEnrolled: true }, { isEnrolled: true }
      ]},
    ]);
    const result = await service.getMetrics();
    expect(result[0].leadsCount).toBe(3);
    expect(result[0].enrollmentsCount).toBe(2);
    expect(result[0].costPerLead).toBe(3333.33);
    expect(result[0].costPerEnrollment).toBe(5000);
  });
});