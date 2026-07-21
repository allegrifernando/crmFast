import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AutomationService } from '../application/automation.service';
import { JwtAuthGuard } from '../../identity/infrastructure/jwt-auth.guard';
import { RequirePermissions } from '../../identity/infrastructure/permissions.decorator';
import { CreateRuleDto, UpdateRuleDto } from './dtos/automation.dto';

@ApiTags('Automations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('automations')
export class AutomationController {
  constructor(private automationService: AutomationService) {}

  @Post('rules')
  @RequirePermissions({ module: 'automations', action: 'create' })
  @ApiOperation({ summary: 'Create automation rule' })
  async createRule(@Body() dto: CreateRuleDto) {
    return this.automationService.createRule(dto);
  }

  @Get('rules')
  @RequirePermissions({ module: 'automations', action: 'read' })
  @ApiOperation({ summary: 'List automation rules' })
  async findAllRules() {
    return this.automationService.findAllRules();
  }

  @Put('rules/:id')
  @RequirePermissions({ module: 'automations', action: 'update' })
  @ApiOperation({ summary: 'Update automation rule' })
  async updateRule(@Param('id') id: string, @Body() dto: UpdateRuleDto) {
    return this.automationService.updateRule(id, dto);
  }

  @Delete('rules/:id')
  @RequirePermissions({ module: 'automations', action: 'delete' })
  @ApiOperation({ summary: 'Delete automation rule' })
  async removeRule(@Param('id') id: string) {
    await this.automationService.removeRule(id);
    return { message: 'Rule deleted' };
  }

  @Post('evaluate')
  @RequirePermissions({ module: 'automations', action: 'manage' })
  @ApiOperation({ summary: 'Manually trigger rule evaluation' })
  async evaluate() {
    return this.automationService.evaluateAndEnqueue();
  }
}
