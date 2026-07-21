import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CalendarService } from '../application/calendar.service';
import { JwtAuthGuard } from '../../identity/infrastructure/jwt-auth.guard';
import { RequirePermissions } from '../../identity/infrastructure/permissions.decorator';
import { CreateEventDto, UpdateEventDto, CreateReminderDto } from './dtos/calendar.dto';

@ApiTags('Agenda')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('agenda')
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Post('events')
  @RequirePermissions({ module: 'agenda', action: 'create' })
  @ApiOperation({ summary: 'Create calendar event' })
  async createEvent(@Body() dto: CreateEventDto, @Req() req: any) {
    return this.calendarService.create({ ...dto, userId: req.user.id });
  }

  @Get('events')
  @RequirePermissions({ module: 'agenda', action: 'read' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiOperation({ summary: 'Get events (day/week/month scope via date range)' })
  async getEvents(
    @Req() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.calendarService.findByUser(req.user.id, startDate, endDate);
  }

  @Put('events/:id')
  @RequirePermissions({ module: 'agenda', action: 'update' })
  @ApiOperation({ summary: 'Update event' })
  async updateEvent(@Param('id') id: string, @Body() dto: UpdateEventDto, @Req() req: any) {
    return this.calendarService.update(id, req.user.id, dto);
  }

  @Delete('events/:id')
  @RequirePermissions({ module: 'agenda', action: 'delete' })
  @ApiOperation({ summary: 'Delete event' })
  async removeEvent(@Param('id') id: string, @Req() req: any) {
    await this.calendarService.remove(id, req.user.id);
    return { message: 'Event deleted' };
  }

  @Post('reminders')
  @RequirePermissions({ module: 'agenda', action: 'create' })
  @ApiOperation({ summary: 'Create reminder' })
  async createReminder(@Body() dto: CreateReminderDto, @Req() req: any) {
    return this.calendarService.createReminder({ ...dto, userId: req.user.id });
  }

  @Get('reminders')
  @RequirePermissions({ module: 'agenda', action: 'read' })
  @ApiQuery({ name: 'includeSent', required: false, type: Boolean })
  @ApiOperation({ summary: 'Get reminders' })
  async getReminders(@Req() req: any, @Query('includeSent') includeSent?: string) {
    return this.calendarService.findReminders(req.user.id, includeSent === 'true');
  }

  @Post('reminders/:id/mark-sent')
  @RequirePermissions({ module: 'agenda', action: 'update' })
  @ApiOperation({ summary: 'Mark reminder as sent' })
  async markReminderSent(@Param('id') id: string) {
    return this.calendarService.markReminderSent(id);
  }

  @Get('notifications')
  @RequirePermissions({ module: 'notifications', action: 'read' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiOperation({ summary: 'Get notifications' })
  async getNotifications(@Req() req: any, @Query('unreadOnly') unreadOnly?: string) {
    return this.calendarService.findNotifications(req.user.id, unreadOnly === 'true');
  }

  @Post('notifications/:id/read')
  @RequirePermissions({ module: 'notifications', action: 'update' })
  @ApiOperation({ summary: 'Mark notification as read' })
  async markNotificationRead(@Param('id') id: string, @Req() req: any) {
    await this.calendarService.markNotificationRead(id, req.user.id);
    return { message: 'Notification marked as read' };
  }
}
