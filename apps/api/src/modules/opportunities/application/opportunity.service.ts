import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AssignmentService } from '../../assignment/application/assignment.service';
import { Channel } from '@prisma/client';

@Injectable()
export class OpportunityService {
  constructor(
    private prisma: PrismaService,
    private assignmentService: AssignmentService,
  ) {}

  async create(data: {
    contactId: string;
    programId: string;
    cohortId?: string;
    channel?: Channel;
    notes?: string;
  }) {
    const contact = await this.prisma.contact.findUnique({ where: { id: data.contactId } });
    if (!contact) throw new NotFoundException('Contact not found');

    const program = await this.prisma.program.findUnique({ where: { id: data.programId } });
    if (!program) throw new NotFoundException('Program not found');

    if (data.cohortId) {
      const cohort = await this.prisma.cohort.findUnique({ where: { id: data.cohortId } });
      if (!cohort) throw new NotFoundException('Cohort not found');
    }

    const firstStage = await this.prisma.pipelineStage.findFirst({
      where: { isActive: true, type: 'NORMAL' },
      orderBy: { order: 'asc' },
    });
    if (!firstStage) throw new BadRequestException('No active pipeline stages configured');

    const advisorId = await this.assignmentService.roundRobinAssign(data.programId);

    const opportunity = await this.prisma.opportunity.create({
      data: {
        contactId: data.contactId,
        programId: data.programId,
        cohortId: data.cohortId,
        stageId: firstStage.id,
        advisorId,
        channel: data.channel || 'MANUAL',
        notes: data.notes,
      },
      include: {
        contact: true,
        program: true,
        stage: true,
        advisor: { select: { id: true, name: true, email: true } },
      },
    });

    await this.prisma.stageHistory.create({
      data: {
        opportunityId: opportunity.id,
        toStageId: firstStage.id,
        actorId: advisorId || 'system',
      },
    });

    return opportunity;
  }

  async findAll(filters: {
    advisorId?: string;
    programId?: string;
    stageId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};
    if (filters.advisorId) where.advisorId = filters.advisorId;
    if (filters.programId) where.programId = filters.programId;
    if (filters.stageId) where.stageId = filters.stageId;

    if (filters.search) {
      where.contact = {
        OR: [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search, mode: 'insensitive' } },
        ],
      };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          contact: true,
          program: true,
          stage: true,
          cohort: true,
          advisor: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.opportunity.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: {
        contact: true,
        program: { include: { faculty: true } },
        stage: true,
        cohort: true,
        advisor: { select: { id: true, name: true, email: true } },
        stageHistory: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!opportunity) throw new NotFoundException('Opportunity not found');
    return opportunity;
  }

  async changeStage(id: string, stageId: string, actorId: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: { stage: true },
    });
    if (!opportunity) throw new NotFoundException('Opportunity not found');

    const stage = await this.prisma.pipelineStage.findUnique({ where: { id: stageId } });
    if (!stage || !stage.isActive) throw new NotFoundException('Stage not found or inactive');

    const fromStageId = opportunity.stageId;

    await this.prisma.opportunity.update({
      where: { id },
      data: { stageId },
    });

    await this.prisma.stageHistory.create({
      data: { opportunityId: id, fromStageId, toStageId: stageId, actorId },
    });

    await this.prisma.activityEvent.create({
      data: {
        opportunityId: id,
        type: 'STAGE_CHANGE',
        description: `Stage changed from "${opportunity.stage.name}" to "${stage.name}"`,
        actorId,
      },
    });

    if (stage.type === 'TERMINAL_ENROLLED') {
      const op = await this.prisma.opportunity.findUnique({ where: { id } });
      if (op && op.cohortId) {
        await this.prisma.opportunity.update({
          where: { id },
          data: { isEnrolled: true, enrolledAt: new Date() },
        });
      }
    }

    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'STAGE_CHANGE',
        entity: 'Opportunity',
        entityId: id,
        metadata: { fromStageId, toStageId: stageId, stageName: stage.name },
      },
    });

    return this.findById(id);
  }

  async enroll(id: string, note?: string, actorId?: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: { stage: true },
    });
    if (!opportunity) throw new NotFoundException('Opportunity not found');

    const enrolledStage = await this.prisma.pipelineStage.findFirst({
      where: { type: 'TERMINAL_ENROLLED', isActive: true },
    });

    if (enrolledStage) {
      await this.prisma.opportunity.update({
        where: { id },
        data: {
          isEnrolled: true,
          enrolledAt: new Date(),
          enrollmentNote: note,
          stageId: enrolledStage.id,
        },
      });

      await this.prisma.stageHistory.create({
        data: {
          opportunityId: id,
          fromStageId: opportunity.stageId,
          toStageId: enrolledStage.id,
          actorId: actorId || 'system',
        },
      });
    } else {
      await this.prisma.opportunity.update({
        where: { id },
        data: { isEnrolled: true, enrolledAt: new Date(), enrollmentNote: note },
      });
    }

    await this.prisma.activityEvent.create({
      data: {
        opportunityId: id,
        type: 'SYSTEM',
        description: 'Opportunity enrolled',
        note,
        actorId: actorId || 'system',
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: actorId || 'system',
        action: 'ENROLLMENT',
        entity: 'Opportunity',
        entityId: id,
        metadata: { note },
      },
    });

    return this.findById(id);
  }

  async update(id: string, data: { cohortId?: string; notes?: string }) {
    const opportunity = await this.prisma.opportunity.findUnique({ where: { id } });
    if (!opportunity) throw new NotFoundException('Opportunity not found');

    return this.prisma.opportunity.update({
      where: { id },
      data,
      include: {
        contact: true,
        program: true,
        stage: true,
        advisor: { select: { id: true, name: true } },
      },
    });
  }

  async reassign(opportunityId: string, newAdvisorId: string, actorId: string) {
    await this.assignmentService.reassignOpportunity(opportunityId, newAdvisorId, actorId);
    return this.findById(opportunityId);
  }
}
