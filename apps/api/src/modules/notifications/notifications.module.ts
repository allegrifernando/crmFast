import { Module } from '@nestjs/common';
import { NotificationService } from './application/notification.service';
import { NotificationController } from './interface/notification.controller';
import { InAppChannel } from './infrastructure/in-app.channel';
import { EmailChannel } from './infrastructure/email.channel';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    { provide: 'NOTIFICATION_CHANNELS', useFactory: (inApp: InAppChannel, email: EmailChannel) => [inApp, email], inject: [InAppChannel, EmailChannel] },
    InAppChannel,
    EmailChannel,
  ],
  exports: [NotificationService],
})
export class NotificationsModule {}
