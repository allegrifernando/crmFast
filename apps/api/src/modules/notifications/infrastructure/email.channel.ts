import { Injectable, Logger } from '@nestjs/common';
import { NotificationChannel } from '@prisma/client';
import { INotificationChannel, SendNotificationInput } from '../domain/notification-channel.interface';

@Injectable()
export class EmailChannel implements INotificationChannel {
  readonly channel: NotificationChannel = NotificationChannel.EMAIL;
  private readonly logger = new Logger(EmailChannel.name);

  async send(input: SendNotificationInput) {
    try {
      this.logger.log(`[EMAIL] To user ${input.userId}: ${input.title} - ${input.message}`);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
