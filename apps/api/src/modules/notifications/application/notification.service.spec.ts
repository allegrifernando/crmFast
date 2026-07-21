import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotificationChannel } from '@prisma/client';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: any;
  let inAppChannel: any;
  let emailChannel: any;

  beforeEach(async () => {
    prisma = {
      notification: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

    inAppChannel = {
      channel: NotificationChannel.IN_APP,
      send: jest.fn().mockResolvedValue({ success: true }),
    };
    emailChannel = {
      channel: NotificationChannel.EMAIL,
      send: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: prisma },
        { provide: 'NOTIFICATION_CHANNELS', useValue: [inAppChannel, emailChannel] },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should send notification via specified channels', async () => {
    const result = await service.send(
      { userId: 'usr-1', title: 'Test', message: 'Hello' },
      [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    );
    expect(result).toHaveLength(2);
    expect(inAppChannel.send).toHaveBeenCalled();
    expect(emailChannel.send).toHaveBeenCalled();
  });

  it('should default to IN_APP channel', async () => {
    const result = await service.send(
      { userId: 'usr-1', title: 'Test', message: 'Hello' },
    );
    expect(result).toHaveLength(1);
    expect(result[0].channel).toBe(NotificationChannel.IN_APP);
  });

  it('should find notifications by user', async () => {
    prisma.notification.findMany.mockResolvedValue([{ id: 'n-1', title: 'Test' }]);
    const result = await service.findByUser('usr-1');
    expect(result).toHaveLength(1);
  });

  it('should filter unread notifications', async () => {
    prisma.notification.findMany.mockResolvedValue([]);
    await service.findByUser('usr-1', true);
    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ readAt: null }),
      }),
    );
  });

  it('should mark as read', async () => {
    prisma.notification.update.mockResolvedValue({ id: 'n-1', readAt: new Date() });
    const result = await service.markAsRead('n-1');
    expect(result.id).toBe('n-1');
  });

  it('should mark all as read', async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 3 });
    const result = await service.markAllAsRead('usr-1');
    expect(result.count).toBe(3);
  });

  it('should get unread count', async () => {
    prisma.notification.count.mockResolvedValue(2);
    const result = await service.getUnreadCount('usr-1');
    expect(result).toBe(2);
  });

  it('should throw on delete nonexistent notification', async () => {
    prisma.notification.findUnique.mockResolvedValue(null);
    await expect(service.remove('bad-id')).rejects.toThrow('Notification not found');
  });
});
