import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateCohortDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  programId: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  enrollmentStartDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  enrollmentEndDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  quota?: number;
}

export class UpdateCohortDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  enrollmentStartDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  enrollmentEndDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  quota?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CohortResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  programId: string;

  @ApiProperty()
  programName?: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate?: Date;

  @ApiProperty()
  enrollmentStartDate?: Date;

  @ApiProperty()
  enrollmentEndDate?: Date;

  @ApiProperty()
  quota?: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;
}
