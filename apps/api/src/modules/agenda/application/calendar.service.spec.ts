import { Test, TestingModule } from '@nestjs/testing';
import { CalendarService } from './calendar.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CalendarService', () => {
  let service: CalendarService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      calendarEvent: {
        findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(),
        update: jest.fn(), delete: jest.fn(),
      },
      reminder: {
        create: jest.fn(), findMany: jest.fn(), update: jest.fn(),
      },
      notification: {
        create: jest.fn(), findMany: jest.fn(), updateMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendarService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
  });

  it('should create event', async () => {
    prisma.calendarEvent.create.mockResolvedValue({
      id: 'ev-1', title: 'Meeting', startDate: new Date(), userId: 'usr-1',
    });
    const result = await service.create({
      title: 'Meeting', startDate: '2026-07-22T10:00:00Z', userId: 'usr-1',
    });
    expect(result.title).toBe('Meeting');
  });

  it('should find events by user with date range', async () => {
    prisma.calendarEvent.findMany.mockResolvedValue([{ id: 'ev-1', title: 'Event' }]);
    const result = await service.findByUser('usr-1', '2026-07-01', '2026-07-31');
    expect(result).toHaveLength(1);
  });

  it('should throw on event not found', async () => {
    prisma.calendarEvent.findUnique.mockResolvedValue(null);
    await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
  });

  it('should create reminder', async () => {
    prisma.reminder.create.mockResolvedValue({ id: 'rem-1', title: 'Follow up', reminderDate: new Date() });
    const result = await service.createReminder({
      title: 'Follow up', reminderDate: '2026-07-25T09:00:00Z', userId: 'usr-1',
    });
    expect(result.title).toBe('Follow up');
  });

  it('should create notification', async () => {
    prisma.notification.create.mockResolvedValue({ id: 'not-1', title: 'Alert', message: 'Test' });
    const result = await service.createNotification({
      userId: 'usr-1', title: 'Alert', message: 'Test',
    });
    expect(result.title).toBe('Alert');
  });

  it('should find unread notifications', async () => {
    prisma.notification.findMany.mockResolvedValue([{ id: 'not-1', title: 'Alert' }]);
    const result = await service.findNotifications('usr-1', true);
    expect(result).toHaveLength(1);
  });
});
