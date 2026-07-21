import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';
import { NotificationChannel } from '@prisma/client';

export class SendNotificationDto {
  @ApiProperty() @IsUUID() userId: string;
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() message: string;
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() referenceId?: string;
  @ApiProperty({ enum: NotificationChannel, isArray: true }) @IsArray() @IsEnum(NotificationChannel, { each: true }) channels: NotificationChannel[];
}
