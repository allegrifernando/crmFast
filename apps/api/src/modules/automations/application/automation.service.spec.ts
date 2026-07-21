import { Test, TestingModule } from '@nestjs/testing';
import { AutomationService } from './automation.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { RuleTrigger, RuleAction } from '@prisma/client';

describe('AutomationService', () => {
  let service: AutomationService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      automationRule: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      opportunity: {
        findMany: jest.fn(),
      },
      notification: { create: jest.fn() },
      reminder: { create: jest.fn() },
      calendarEvent: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutomationService,
        { provide: PrismaService, useValue: prisma },
        { provide: 'BullQueue_automation', useValue: { add: jest.fn() } },
      ],
    }).compile();

    service = module.get<AutomationService>(AutomationService);
  });

  it('should create rule', async () => {
    prisma.automationRule.create.mockResolvedValue({
      id: 'r-1', name: 'Test', trigger: RuleTrigger.INACTIVITY, action: RuleAction.SEND_NOTIFICATION,
    });
    const result = await service.createRule({
      name: 'Test', trigger: RuleTrigger.INACTIVITY, action: RuleAction.SEND_NOTIFICATION, config: {},
    });
    expect(result.name).toBe('Test');
  });

  it('should throw on rule not found', async () => {
    prisma.automationRule.findUnique.mockResolvedValue(null);
    await expect(service.updateRule('bad-id', { name: 'Test' })).rejects.toThrow(NotFoundException);
  });

  it('should process inactivity rule', async () => {
    prisma.opportunity.findMany.mockResolvedValue([{
      id: 'opp-1', contact: { firstName: 'Juan', lastName: 'Pérez' }, advisorId: 'adv-1',
    }]);
    prisma.notification.create.mockResolvedValue({});

    const result = await service.processInactivityRule({ days: 7 });
    expect(result.processed).toBe(1);
  });

  it('should process follow-up rule', async () => {
    prisma.opportunity.findMany.mockResolvedValue([{
      id: 'opp-1', contact: { firstName: 'Juan', lastName: 'Pérez' }, advisorId: 'adv-1',
    }]);
    prisma.reminder.create.mockResolvedValue({});

    const result = await service.processFollowUpRule({ days: 3 });
    expect(result.processed).toBe(1);
  });

  it('should process auto task rule', async () => {
    prisma.opportunity.findMany.mockResolvedValue([{
      id: 'opp-1', contact: { firstName: 'Juan', lastName: 'Pérez' }, advisorId: 'adv-1',
    }]);
    prisma.calendarEvent.create.mockResolvedValue({});

    const result = await service.processAutoTaskRule({ stageId: 'st-1', taskTitle: 'Follow up' });
    expect(result.processed).toBe(1);
  });
});