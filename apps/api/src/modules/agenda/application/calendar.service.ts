import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EventType } from '@prisma/client';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    title: string;
    description?: string;
    type?: EventType;
    startDate: string;
    endDate?: string;
    allDay?: boolean;
    userId: string;
    opportunityId?: string;
  }) {
    return this.prisma.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type || 'APPOINTMENT',
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        allDay: data.allDay || false,
        userId: data.userId,
        opportunityId: data.opportunityId,
      },
    });
  }

  async findByUser(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate && endDate) {
      where.startDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    return this.prisma.calendarEvent.findMany({
      where,
      orderBy: { startDate: 'asc' },
      include: {
        opportunity: {
          select: { id: true, contact: { select: { firstName: true, lastName: true } } },
        },
      },
    });
  }

  async findById(id: string) {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: string, userId: string, data: {
    title?: string; description?: string; startDate?: string; endDate?: string;
    allDay?: boolean; isCompleted?: boolean;
  }) {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.userId !== userId) throw new NotFoundException('Event not found');

    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.allDay !== undefined) updateData.allDay = data.allDay;
    if (data.isCompleted !== undefined) updateData.isCompleted = data.isCompleted;

    return this.prisma.calendarEvent.update({ where: { id }, data: updateData });
  }

  async remove(id: string, userId: string) {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    if (event.userId !== userId) throw new NotFoundException('Event not found');

    await this.prisma.calendarEvent.delete({ where: { id } });
  }

  // Reminders
  async createReminder(data: {
    title: string; description?: string; reminderDate: string;
    userId: string; opportunityId?: string; calendarEventId?: string;
  }) {
    return this.prisma.reminder.create({
      data: {
        title: data.title, description: data.description,
        reminderDate: new Date(data.reminderDate),
        userId: data.userId, opportunityId: data.opportunityId,
        calendarEventId: data.calendarEventId,
      },
    });
  }

  async findReminders(userId: string, includeSent = false) {
    const where: any = { userId };
    if (!includeSent) where.isSent = false;

    return this.prisma.reminder.findMany({
      where,
      orderBy: { reminderDate: 'asc' },
    });
  }

  async markReminderSent(id: string) {
    return this.prisma.reminder.update({ where: { id }, data: { isSent: true } });
  }

  // Notifications
  async createNotification(data: { userId: string; title: string; message: string; type?: string; referenceId?: string }) {
    return this.prisma.notification.create({ data });
  }

  async findNotifications(userId: string, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) where.readAt = null;

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async markNotificationRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
  }
}
