import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentService } from '../application/document.service';
import { JwtAuthGuard } from '../../identity/infrastructure/jwt-auth.guard';
import { RequirePermissions } from '../../identity/infrastructure/permissions.decorator';
import { UploadDocumentDto, UpdateDocumentStatusDto } from './dtos/document.dto';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  @Post()
  @RequirePermissions({ module: 'documents', action: 'create' })
  @ApiOperation({ summary: 'Upload document to opportunity' })
  async upload(@Body() dto: UploadDocumentDto) {
    return this.documentService.upload({
      ...dto,
      uploadedById: 'system',
    });
  }

  @Get('opportunity/:opportunityId')
  @RequirePermissions({ module: 'documents', action: 'read' })
  @ApiOperation({ summary: 'List documents by opportunity' })
  async findByOpportunity(@Param('opportunityId') opportunityId: string) {
    return this.documentService.findByOpportunity(opportunityId);
  }

  @Get(':id')
  @RequirePermissions({ module: 'documents', action: 'read' })
  @ApiOperation({ summary: 'Get document by ID' })
  async findById(@Param('id') id: string) {
    return this.documentService.findById(id);
  }

  @Put(':id/status')
  @RequirePermissions({ module: 'documents', action: 'update' })
  @ApiOperation({ summary: 'Update document status' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateDocumentStatusDto) {
    return this.documentService.updateStatus(id, dto.status, dto.notes);
  }

  @Delete(':id')
  @RequirePermissions({ module: 'documents', action: 'delete' })
  @ApiOperation({ summary: 'Delete document' })
  async remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }

  @Get('opportunity/:opportunityId/missing')
  @RequirePermissions({ module: 'documents', action: 'read' })
  @ApiOperation({ summary: 'Get missing required document types' })
  async getMissingDocuments(@Param('opportunityId') opportunityId: string) {
    return this.documentService.getMissingDocuments(opportunityId);
  }
}
