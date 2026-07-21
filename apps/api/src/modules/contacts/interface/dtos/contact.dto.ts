import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { Channel } from '@prisma/client';

export class CreateContactDto {
  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() identityDocument?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() identityType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional({ enum: Channel }) @IsOptional() @IsEnum(Channel) channel?: Channel;
}

export class UpdateContactDto {
  @ApiPropertyOptional() @IsOptional() @IsString() firstName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() lastName?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() identityDocument?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() identityType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class ContactResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() email?: string;
  @ApiProperty() phone?: string;
  @ApiProperty() identityDocument?: string;
  @ApiProperty() identityType?: string;
  @ApiProperty() city?: string;
  @ApiProperty() channel: string;
  @ApiProperty() isDuplicate: boolean;
  @ApiProperty() createdAt: Date;
}
