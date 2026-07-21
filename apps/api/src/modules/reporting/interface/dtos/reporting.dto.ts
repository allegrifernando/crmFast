import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';

export class DashboardFiltersDto {
  @ApiPropertyOptional() @IsOptional() @IsString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() advisorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() programId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() campaignId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
}

export class ExportReportDto {
  @ApiProperty() @IsEnum(['pdf', 'excel', 'csv']) format: 'pdf' | 'excel' | 'csv';
  @ApiProperty() reportType: string;
  @ApiPropertyOptional() filters?: DashboardFiltersDto;
}