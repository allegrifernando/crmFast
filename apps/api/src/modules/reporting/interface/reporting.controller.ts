import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportingService } from '../application/reporting.service';
import { JwtAuthGuard } from '../../identity/infrastructure/jwt-auth.guard';
import { RequirePermissions } from '../../identity/infrastructure/permissions.decorator';

@ApiTags('Reporting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reporting')
export class ReportingController {
  constructor(private reportingService: ReportingService) {}

  @Get('dashboard/executive')
  @RequirePermissions({ module: 'reporting', action: 'read' })
  @ApiOperation({ summary: 'Executive dashboard' })
  async getExecutiveDashboard(@Query() filters: any) {
    return this.reportingService.getExecutiveDashboard(filters);
  }

  @Get('dashboard/advisor')
  @RequirePermissions({ module: 'reporting', action: 'read' })
  @ApiOperation({ summary: 'Personal advisor dashboard' })
  async getAdvisorDashboard(@Req() req: any, @Query() filters: any) {
    return this.reportingService.getAdvisorDashboard(req.user.id, filters);
  }

  @Get('funnel')
  @RequirePermissions({ module: 'reporting', action: 'read' })
  @ApiOperation({ summary: 'Pipeline funnel by stage' })
  async getFunnel(@Query() filters: any) {
    return this.reportingService.getFunnelData(filters);
  }

  @Get('conversion/program')
  @RequirePermissions({ module: 'reporting', action: 'read' })
  @ApiOperation({ summary: 'Conversion by program' })
  async getConversionByProgram(@Query() filters: any) {
    return this.reportingService.getConversionByProgram(filters);
  }

  @Get('conversion/campaign')
  @RequirePermissions({ module: 'reporting', action: 'read' })
  @ApiOperation({ summary: 'Conversion by campaign' })
  async getConversionByCampaign(@Query() filters: any) {
    return this.reportingService.getConversionByCampaign(filters);
  }

  @Get('conversion/city')
  @RequirePermissions({ module: 'reporting', action: 'read' })
  @ApiOperation({ summary: 'Conversion by city' })
  async getConversionByCity(@Query() filters: any) {
    return this.reportingService.getConversionByCity(filters);
  }

  @Get('advisor/ranking')
  @RequirePermissions({ module: 'reporting', action: 'read' })
  @ApiOperation({ summary: 'Advisor ranking' })
  async getAdvisorRanking(@Query() filters: any) {
    return this.reportingService.getAdvisorRanking(filters);
  }

  @Get('goals/compliance')
  @RequirePermissions({ module: 'reporting', action: 'read' })
  @ApiOperation({ summary: 'Goal compliance' })
  async getGoalCompliance(@Query() filters: any) {
    return this.reportingService.getGoalCompliance(filters);
  }

  @Post('export')
  @RequirePermissions({ module: 'reporting', action: 'manage' })
  @ApiOperation({ summary: 'Export report (PDF/Excel/CSV)' })
  async export(@Body() dto: { format: string; reportType: string; filters?: any }) {
    return this.reportingService.exportReport(dto);
  }

  @Post('refresh')
  @RequirePermissions({ module: 'reporting', action: 'manage' })
  @ApiOperation({ summary: 'Refresh materialized views' })
  async refresh() {
    await this.reportingService.refreshMaterializedViews();
    return { message: 'Views refreshed' };
  }
}