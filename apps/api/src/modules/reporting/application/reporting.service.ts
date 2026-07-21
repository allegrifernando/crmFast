import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { DashboardFiltersDto } from '../interface/dtos/reporting.dto';

@Injectable()
export class ReportingService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('reporting') private reportingQueue: Queue,
  ) {}

  async getPersonalDashboard(userId: string, filters: DashboardFiltersDto) {
    const where: any = { advisorId: userId };
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [myFunnel, myOpportunities, myGoals, myActivities] = await Promise.all([
      this.getFunnelData({ ...filters, advisorId: userId }),
      this.prisma.opportunity.count({ where }),
      this.getGoalCompliance({ ...filters, advisorId: userId }),
      this.prisma.activityEvent.count({ where: { actorId: userId } }),
    ]);

    return {
      funnel: myFunnel,
      opportunitiesCount: myOpportunities,
      goals: myGoals,
      activitiesCount: myActivities,
    };
  }

  async getExecutiveDashboard(filters: DashboardFiltersDto) {
    const [funnel, conversionByProgram, conversionByCampaign, conversionByCity, advisorRanking, goals] = await Promise.all([
      this.getFunnelData(filters),
      this.getConversionByProgram(filters),
      this.getConversionByCampaign(filters),
      this.getConversionByCity(filters),
      this.getAdvisorRanking(filters),
      this.getGoalCompliance(filters),
    ]);

    return {
      funnel,
      conversionByProgram,
      conversionByCampaign,
      conversionByCity,
      advisorRanking,
      goals,
    };
  }

  async getFunnelData(filters: DashboardFiltersDto) {
    const stages = await this.prisma.pipelineStage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    const where: any = { isEnrolled: false };
    if (filters.advisorId) where.advisorId = filters.advisorId;
    if (filters.programId) where.programId = filters.programId;

    const counts = await this.prisma.opportunity.groupBy({
      by: ['stageId'],
      where,
      _count: { id: true },
    });

    return stages.map((s) => ({
      stageId: s.id,
      stageName: s.name,
      count: counts.find((c) => c.stageId === s.id)?._count.id || 0,
      isTerminal: s.type !== 'NORMAL',
    }));
  }

  async getConversionByProgram(filters: DashboardFiltersDto) {
    const where: any = { isEnrolled: false };
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    return this.prisma.$queryRaw`
      SELECT p.id as "programId", p.name as "programName", 
        COUNT(o.id) as "totalLeads",
        COUNT(CASE WHEN o."isEnrolled" = true THEN 1 END) as "enrollments",
        CASE WHEN COUNT(o.id) > 0 
          THEN ROUND(COUNT(CASE WHEN o."isEnrolled" = true THEN 1 END)::numeric / COUNT(o.id) * 100, 2)
          ELSE 0 END as "conversionRate"
      FROM "opportunities" o
      JOIN "programs" p ON o."programId" = p.id
      WHERE 1=1
      ${filters.startDate ? `AND o."createdAt" >= ${filters.startDate}` : ''}
      ${filters.endDate ? `AND o."createdAt" <= ${filters.endDate}` : ''}
      ${filters.campaignId ? `AND o."campaignId" = ${filters.campaignId}` : ''}
      GROUP BY p.id, p.name
      ORDER BY "enrollments" DESC
    `;
  }

  async getConversionByCampaign(filters: DashboardFiltersDto) {
    return this.prisma.$queryRaw`
      SELECT c.id as "campaignId", c.name as "campaignName", c.cost,
        COUNT(o.id) as "totalLeads",
        COUNT(CASE WHEN o."isEnrolled" = true THEN 1 END) as "enrollments",
        CASE WHEN COUNT(o.id) > 0 
          THEN ROUND(COUNT(CASE WHEN o."isEnrolled" = true THEN 1 END)::numeric / COUNT(o.id) * 100, 2)
          ELSE 0 END as "conversionRate"
      FROM "opportunities" o
      JOIN "campaigns" c ON o."campaignId" = c.id
      WHERE o."campaignId" IS NOT NULL
      GROUP BY c.id, c.name, c.cost
      ORDER BY "enrollments" DESC
    `;
  }

  async getConversionByCity(filters: DashboardFiltersDto) {
    return this.prisma.$queryRaw`
      SELECT cont.city, 
        COUNT(o.id) as "totalLeads",
        COUNT(CASE WHEN o."isEnrolled" = true THEN 1 END) as "enrollments",
        CASE WHEN COUNT(o.id) > 0 
          THEN ROUND(COUNT(CASE WHEN o."isEnrolled" = true THEN 1 END)::numeric / COUNT(o.id) * 100, 2)
          ELSE 0 END as "conversionRate"
      FROM "opportunities" o
      JOIN "contacts" cont ON o."contactId" = cont.id
      WHERE cont.city IS NOT NULL
      GROUP BY cont.city
      ORDER BY "enrollments" DESC
    `;
  }

  async getAdvisorRanking(filters: DashboardFiltersDto) {
    const where: any = { isEnrolled: true };
    if (filters.startDate || filters.endDate) {
      where.enrolledAt = {};
      if (filters.startDate) where.enrolledAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.enrolledAt.lte = new Date(filters.endDate);
    }

    return this.prisma.$queryRaw`
      SELECT u.id as "advisorId", u.name as "advisorName",
        COUNT(o.id) as "enrollments",
        ROUND(AVG(o."enrolledAt" - o."createdAt")::numeric / 86400000, 1) as "avgDaysToEnroll"
      FROM "opportunities" o
      JOIN "users" u ON o."advisorId" = u.id
      WHERE o."isEnrolled" = true
      ${filters.startDate ? `AND o."enrolledAt" >= ${filters.startDate}` : ''}
      ${filters.endDate ? `AND o."enrolledAt" <= ${filters.endDate}` : ''}
      GROUP BY u.id, u.name
      ORDER BY "enrollments" DESC
    `;
  }

  async getGoalCompliance(filters: DashboardFiltersDto) {
    const where: any = {};
    if (filters.advisorId) where.advisorId = filters.advisorId;

    const goals = await this.prisma.advisorGoal.findMany({ where });
    const result = [];

    for (const goal of goals) {
      const enrollments = await this.prisma.opportunity.count({
        where: {
          advisorId: goal.advisorId,
          isEnrolled: true,
          enrolledAt: { gte: goal.periodStart, lte: goal.periodEnd },
        },
      });

      result.push({
        advisorId: goal.advisorId,
        periodStart: goal.periodStart,
        periodEnd: goal.periodEnd,
        target: goal.targetEnrolled,
        actual: enrollments,
        compliance: goal.targetEnrolled > 0 ? (enrollments / goal.targetEnrolled * 100).toFixed(2) : 0,
      });
    }

    return result;
  }

  async exportReport(dto: { format: string; reportType: string; filters?: DashboardFiltersDto }) {
    await this.reportingQueue.add('export-report', dto);
    return { message: 'Export queued' };
  }

  async getAdvisorDashboard(userId: string, filters: DashboardFiltersDto) {
    const where: any = { advisorId: userId };
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [myFunnel, myOpportunities, myGoals, myActivities] = await Promise.all([
      this.getFunnelData({ ...filters, advisorId: userId }),
      this.prisma.opportunity.count({ where }),
      this.getGoalCompliance({ ...filters, advisorId: userId }),
      this.prisma.activityEvent.count({ where: { actorId: userId } }),
    ]);

    return {
      funnel: myFunnel,
      opportunitiesCount: myOpportunities,
      goals: myGoals,
      activitiesCount: myActivities,
    };
  }

  async refreshMaterializedViews() {
    await this.prisma.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_funnel_by_stage`;
    await this.prisma.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_conversion_by_dimension`;
    await this.prisma.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_advisor_ranking`;
    await this.prisma.$executeRaw`REFRESH MATERIALIZED VIEW CONCURRENTLY mv_goal_compliance`;
  }
}