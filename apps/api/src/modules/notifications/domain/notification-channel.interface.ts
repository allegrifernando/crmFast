import { NotificationChannel } from '@prisma/client';

export interface SendNotificationInput {
  userId: string;
  title: string;
  message: string;
  type?: string;
  referenceId?: string;
}

export interface INotificationChannel {
  readonly channel: NotificationChannel;
  send(input: SendNotificationInput): Promise<{ success: boolean; error?: string }>;
}
