import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AssignmentService {
  constructor(private prisma: PrismaService) {}

  async assignAdvisorToProgram(advisorId: string, programId: string) {
    const advisor = await this.prisma.user.findUnique({ where: { id: advisorId } });
    if (!advisor) throw new NotFoundException('Advisor not found');
    const program = await this.prisma.program.findUnique({ where: { id: programId } });
    if (!program) throw new NotFoundException('Program not found');

    const existing = await this.prisma.advisorProgram.findUnique({
      where: { advisorId_programId: { advisorId, programId } },
    });
    if (existing) return existing;

    const count = await this.prisma.advisorProgram.count({ where: { programId } });

    return this.prisma.advisorProgram.create({
      data: { advisorId, programId, cursor: 0 },
    });
  }

  async removeAdvisorFromProgram(advisorId: string, programId: string) {
    const ap = await this.prisma.advisorProgram.findUnique({
      where: { advisorId_programId: { advisorId, programId } },
    });
    if (!ap) throw new NotFoundException('Assignment not found');
    await this.prisma.advisorProgram.delete({ where: { id: ap.id } });
  }

  async getProgramAdvisors(programId: string) {
    return this.prisma.advisorProgram.findMany({
      where: { programId, isActive: true },
      include: { advisor: { select: { id: true, name: true, email: true } } },
    });
  }

  async roundRobinAssign(programId: string): Promise<string | null> {
    const advisors = await this.prisma.advisorProgram.findMany({
      where: { programId, isActive: true },
      orderBy: { cursor: 'asc' },
    });

    if (advisors.length === 0) return null;

    const minCursor = Math.min(...advisors.map((a) => a.cursor));
    const candidate = advisors.find((a) => a.cursor === minCursor)!;

    await this.prisma.advisorProgram.update({
      where: { id: candidate.id },
      data: { cursor: candidate.cursor + 1 },
    });

    return candidate.advisorId;
  }

  async reassignOpportunity(opportunityId: string, newAdvisorId: string, actorId: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
    });
    if (!opportunity) throw new NotFoundException('Opportunity not found');

    const advisor = await this.prisma.user.findUnique({ where: { id: newAdvisorId } });
    if (!advisor) throw new NotFoundException('Advisor not found');

    const oldAdvisorId = opportunity.advisorId;

    await this.prisma.opportunity.update({
      where: { id: opportunityId },
      data: { advisorId: newAdvisorId },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'REASSIGN',
        entity: 'Opportunity',
        entityId: opportunityId,
        metadata: { fromAdvisorId: oldAdvisorId, toAdvisorId: newAdvisorId },
      },
    });
  }
}
