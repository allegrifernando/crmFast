import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentService } from '../application/assignment.service';
import { JwtAuthGuard } from '../../identity/infrastructure/jwt-auth.guard';
import { RequirePermissions } from '../../identity/infrastructure/permissions.decorator';
import { AssignAdvisorDto } from './dtos/assignment.dto';

@ApiTags('Assignment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assignment')
export class AssignmentController {
  constructor(private assignmentService: AssignmentService) {}

  @Post('advisors')
  @RequirePermissions({ module: 'opportunities', action: 'manage' })
  @ApiOperation({ summary: 'Assign advisor to program' })
  async assignAdvisor(@Body() dto: AssignAdvisorDto) {
    return this.assignmentService.assignAdvisorToProgram(dto.advisorId, dto.programId);
  }

  @Delete('advisors/:advisorId/programs/:programId')
  @RequirePermissions({ module: 'opportunities', action: 'manage' })
  @ApiOperation({ summary: 'Remove advisor from program' })
  async removeAdvisor(@Param('advisorId') advisorId: string, @Param('programId') programId: string) {
    await this.assignmentService.removeAdvisorFromProgram(advisorId, programId);
    return { message: 'Advisor removed from program' };
  }

  @Get('programs/:programId/advisors')
  @RequirePermissions({ module: 'opportunities', action: 'read' })
  @ApiOperation({ summary: 'Get advisors for program' })
  async getProgramAdvisors(@Param('programId') programId: string) {
    return this.assignmentService.getProgramAdvisors(programId);
  }
}
