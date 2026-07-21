import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, Min } from 'class-validator';
import { StageType } from '@prisma/client';

export class CreateStageDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsNumber() @Min(0) order: number;
  @ApiPropertyOptional({ enum: StageType }) @IsOptional() @IsEnum(StageType) type?: StageType;
}

export class UpdateStageDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) order?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}

export class StageResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() order: number;
  @ApiProperty({ enum: StageType }) type: string;
  @ApiProperty() isActive: boolean;
}
