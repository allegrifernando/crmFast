import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from '../application/user.service';
import { JwtAuthGuard } from '../infrastructure/jwt-auth.guard';
import { RequirePermissions } from '../infrastructure/permissions.decorator';
import { CreateUserDto, UpdateUserDto } from './dtos/user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @RequirePermissions({ module: 'users', action: 'create' })
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  @RequirePermissions({ module: 'users', action: 'read' })
  @ApiOperation({ summary: 'List all users' })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @RequirePermissions({ module: 'users', action: 'read' })
  @ApiOperation({ summary: 'Get user by ID' })
  async findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put(':id')
  @RequirePermissions({ module: 'users', action: 'update' })
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions({ module: 'users', action: 'delete' })
  @ApiOperation({ summary: 'Deactivate user' })
  async deactivate(@Param('id') id: string) {
    return this.userService.deactivate(id);
  }

  @Get('permissions/matrix')
  @RequirePermissions({ module: 'users', action: 'manage' })
  @ApiOperation({ summary: 'Get permission matrix' })
  async getPermissionMatrix() {
    return this.userService.getPermissionMatrix();
  }
}
