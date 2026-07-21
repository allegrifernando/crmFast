import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from '../application/notification.service';
import { JwtAuthGuard } from '../../identity/infrastructure/jwt-auth.guard';
import { RequirePermissions } from '../../identity/infrastructure/permissions.decorator';
import { SendNotificationDto } from './dtos/notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('send')
  @RequirePermissions({ module: 'notifications', action: 'create' })
  @ApiOperation({ summary: 'Send notification via specified channels' })
  async send(@Body() dto: SendNotificationDto) {
    return this.notificationService.send(dto, dto.channels);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my notifications' })
  @ApiQuery({ name: 'unreadOnly', required: false })
  async findMy(
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationService.findByUser('system', unreadOnly === 'true');
  }

  @Get('my/unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount() {
    return { count: await this.notificationService.getUnreadCount('system') };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Put('my/read-all')
  @ApiOperation({ summary: 'Mark all my notifications as read' })
  async markAllAsRead() {
    return this.notificationService.markAllAsRead('system');
  }

  @Delete(':id')
  @RequirePermissions({ module: 'notifications', action: 'delete' })
  @ApiOperation({ summary: 'Delete notification' })
  async remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }
}
