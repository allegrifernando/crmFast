import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, IsObject } from 'class-validator';
import { RuleTrigger, RuleAction } from '@prisma/client';

export class CreateRuleDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: RuleTrigger }) @IsEnum(RuleTrigger) trigger: RuleTrigger;
  @ApiProperty({ enum: RuleAction }) @IsEnum(RuleAction) action: RuleAction;
  @ApiProperty() @IsObject() config: Record<string, unknown>;
}

export class UpdateRuleDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsObject() config?: Record<string, unknown>;
}
