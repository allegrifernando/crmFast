import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsDateString, IsBoolean, IsEnum } from 'class-validator';
import { Channel } from '@prisma/client';

export class CreateCampaignDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: Channel }) @IsOptional() @IsEnum(Channel) channel?: Channel;
  @ApiPropertyOptional() @IsOptional() @IsString() source?: string;
  @ApiProperty() @IsNumber() @Min(0) cost: number;
  @ApiProperty() @IsDateString() startDate: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
}

export class UpdateCampaignDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: Channel }) @IsOptional() @IsEnum(Channel) channel?: Channel;
  @ApiPropertyOptional() @IsOptional() @IsString() source?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) cost?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class CampaignMetricsDto {
  @ApiProperty() campaignId: string;
  @ApiProperty() campaignName: string;
  @ApiProperty() totalCost: number;
  @ApiProperty() leadsCount: number;
  @ApiProperty() enrollmentsCount: number;
  @ApiProperty() costPerLead: number;
  @ApiProperty() costPerEnrollment: number;
  @ApiProperty() roi: number;
}