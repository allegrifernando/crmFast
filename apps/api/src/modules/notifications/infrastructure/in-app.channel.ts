import { Injectable } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';
import { INotificationChannel, SendNotificationInput } from '../domain/notification-channel.interface';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class InAppChannel implements INotificationChannel {
  readonly channel: NotificationChannel = NotificationChannel.IN_APP;

  constructor(private prisma: PrismaService) {}

  async send(input: SendNotificationInput) {
    try {
      await this.prisma.notification.create({
        data: {
          userId: input.userId,
          title: input.title,
          message: input.message,
          type: input.type || 'INFO',
          referenceId: input.referenceId,
        },
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
