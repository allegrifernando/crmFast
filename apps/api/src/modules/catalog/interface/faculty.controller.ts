import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FacultyService } from '../application/faculty.service';
import { JwtAuthGuard } from '../../identity/infrastructure/jwt-auth.guard';
import { RequirePermissions } from '../../identity/infrastructure/permissions.decorator';
import { Public } from '../../identity/infrastructure/public.decorator';
import { CreateFacultyDto, UpdateFacultyDto } from './dtos/faculty.dto';

@ApiTags('Catalog - Faculties')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalog/faculties')
export class FacultyController {
  constructor(private facultyService: FacultyService) {}

  @Post()
  @RequirePermissions({ module: 'catalog', action: 'create' })
  @ApiOperation({ summary: 'Create a faculty' })
  async create(@Body() dto: CreateFacultyDto) {
    return this.facultyService.create(dto);
  }

  @Public()
  @Get()
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiOperation({ summary: 'List all faculties' })
  async findAll(@Query('includeInactive') includeInactive?: string) {
    return this.facultyService.findAll(includeInactive === 'true');
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get faculty by ID' })
  async findById(@Param('id') id: string) {
    return this.facultyService.findById(id);
  }

  @Put(':id')
  @RequirePermissions({ module: 'catalog', action: 'update' })
  @ApiOperation({ summary: 'Update faculty' })
  async update(@Param('id') id: string, @Body() dto: UpdateFacultyDto) {
    return this.facultyService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ module: 'catalog', action: 'delete' })
  @ApiOperation({ summary: 'Deactivate or delete faculty' })
  async remove(@Param('id') id: string) {
    return this.facultyService.remove(id);
  }
}
