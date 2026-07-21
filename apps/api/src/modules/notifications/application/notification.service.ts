import { Injectable, Inject, Logger } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { INotificationChannel, SendNotificationInput } from '../domain/notification-channel.interface';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    @Inject('NOTIFICATION_CHANNELS') private channels: INotificationChannel[],
  ) {}

  async send(input: SendNotificationInput, channels?: NotificationChannel[]) {
    const targets = channels || [NotificationChannel.IN_APP];
    const results: { channel: NotificationChannel; success: boolean; error?: string }[] = [];

    for (const channelType of targets) {
      const adapter = this.channels.find((c) => c.channel === channelType);
      if (!adapter) {
        this.logger.warn(`No adapter for channel ${channelType}`);
        continue;
      }

      const result = await adapter.send(input);
      results.push({ channel: channelType, ...result });
    }

    return results;
  }

  async findByUser(userId: string, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) where.readAt = null;

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  async remove(id: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new Error('Notification not found');
    return this.prisma.notification.delete({ where: { id } });
  }
}
