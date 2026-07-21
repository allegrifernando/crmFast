import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { DocumentType, DocumentStatus } from '@prisma/client';

export class UploadDocumentDto {
  @ApiProperty() @IsUUID() opportunityId: string;
  @ApiProperty({ enum: DocumentType }) @IsEnum(DocumentType) type: DocumentType;
  @ApiProperty() @IsString() fileName: string;
  @ApiProperty() @IsString() fileUrl: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() fileSize?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() mimeType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class UpdateDocumentStatusDto {
  @ApiProperty({ enum: DocumentStatus }) @IsEnum(DocumentStatus) status: DocumentStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}
