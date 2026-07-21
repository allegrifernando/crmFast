import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Channel } from '@prisma/client';

export class CreateOpportunityDto {
  @ApiProperty() @IsString() contactId: string;
  @ApiProperty() @IsString() programId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cohortId?: string;
  @ApiPropertyOptional({ enum: Channel }) @IsOptional() @IsEnum(Channel) channel?: Channel;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateOpportunityDto {
  @ApiPropertyOptional() @IsOptional() @IsString() cohortId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class ChangeStageDto {
  @ApiProperty() @IsString() stageId: string;
}

export class EnrollDto {
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}

export class OpportunityResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() contactId: string;
  @ApiProperty() programId: string;
  @ApiProperty() cohortId?: string;
  @ApiProperty() stageId: string;
  @ApiProperty() advisorId?: string;
  @ApiProperty() channel: string;
  @ApiProperty() isEnrolled: boolean;
  @ApiProperty() createdAt: Date;
}
