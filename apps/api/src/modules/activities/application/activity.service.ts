import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ActivityType } from '@prisma/client';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    opportunityId: string;
    type: ActivityType;
    description: string;
    note?: string;
    fileUrl?: string;
    fileName?: string;
    actorId: string;
  }) {
    const opp = await this.prisma.opportunity.findUnique({ where: { id: data.opportunityId } });
    if (!opp) throw new NotFoundException('Opportunity not found');

    return this.prisma.activityEvent.create({ data });
  }

  async findByOpportunity(opportunityId: string, page = 1, limit = 50) {
    const where = { opportunityId };

    const [data, total] = await Promise.all([
      this.prisma.activityEvent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activityEvent.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async logStageChange(
    opportunityId: string,
    fromStageName: string | null,
    toStageName: string,
    actorId: string,
  ) {
    return this.prisma.activityEvent.create({
      data: {
        opportunityId,
        type: 'STAGE_CHANGE',
        description: `Stage changed from "${fromStageName || 'none'}" to "${toStageName}"`,
        actorId,
      },
    });
  }

  async logEnrollment(
    opportunityId: string,
    note: string | undefined,
    actorId: string,
  ) {
    return this.prisma.activityEvent.create({
      data: {
        opportunityId,
        type: 'SYSTEM',
        description: 'Opportunity enrolled',
        note,
        actorId,
      },
    });
  }
}
