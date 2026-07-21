import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContactService } from '../application/contact.service';
import { JwtAuthGuard } from '../../identity/infrastructure/jwt-auth.guard';
import { RequirePermissions } from '../../identity/infrastructure/permissions.decorator';
import { CreateContactDto, UpdateContactDto } from './dtos/contact.dto';

@ApiTags('Contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  @RequirePermissions({ module: 'contacts', action: 'create' })
  @ApiOperation({ summary: 'Create contact with dedup' })
  async create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }

  @Get()
  @RequirePermissions({ module: 'contacts', action: 'read' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiOperation({ summary: 'List/search contacts' })
  async findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.contactService.findAll(search, Number(page) || 1, Number(limit) || 20);
  }

  @Get(':id')
  @RequirePermissions({ module: 'contacts', action: 'read' })
  @ApiOperation({ summary: 'Get contact by ID' })
  async findById(@Param('id') id: string) {
    return this.contactService.findById(id);
  }

  @Put(':id')
  @RequirePermissions({ module: 'contacts', action: 'update' })
  @ApiOperation({ summary: 'Update contact' })
  async update(@Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.contactService.update(id, dto);
  }

  @Post(':id/mark-duplicate/:originalId')
  @RequirePermissions({ module: 'contacts', action: 'update' })
  @ApiOperation({ summary: 'Mark contact as duplicate' })
  async markDuplicate(@Param('id') id: string, @Param('originalId') originalId: string) {
    return this.contactService.markDuplicate(id, originalId);
  }
}
