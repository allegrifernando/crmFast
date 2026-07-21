import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ActivityType } from '@prisma/client';

export class CreateActivityDto {
  @ApiProperty() @IsString() opportunityId: string;
  @ApiProperty({ enum: ActivityType }) @IsEnum(ActivityType) type: ActivityType;
  @ApiProperty() @IsString() description: string;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fileUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() fileName?: string;
}

export class ActivityResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() opportunityId: string;
  @ApiProperty({ enum: ActivityType }) type: string;
  @ApiProperty() description: string;
  @ApiProperty() note?: string;
  @ApiProperty() actorId: string;
  @ApiProperty() createdAt: Date;
}
