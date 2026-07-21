import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../prisma/prisma.service';
import { RuleTrigger, RuleAction } from '@prisma/client';

@Injectable()
export class AutomationService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('automation') private automationQueue: Queue,
  ) {}

  async createRule(data: {
    name: string; description?: string; trigger: RuleTrigger;
    action: RuleAction; config: Record<string, unknown>;
  }) {
    return this.prisma.automationRule.create({ data: data as any });
  }

  async findAllRules(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    return this.prisma.automationRule.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async updateRule(id: string, data: { name?: string; description?: string; isActive?: boolean; config?: Record<string, unknown> }) {
    const rule = await this.prisma.automationRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Rule not found');
    return this.prisma.automationRule.update({ where: { id }, data: data as any });
  }

  async removeRule(id: string) {
    const rule = await this.prisma.automationRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Rule not found');
    await this.prisma.automationRule.delete({ where: { id } });
  }

  async evaluateAndEnqueue() {
    const rules = await this.prisma.automationRule.findMany({
      where: { isActive: true },
    });

    for (const rule of rules) {
      await this.automationQueue.add('evaluate-rule', {
        ruleId: rule.id,
        trigger: rule.trigger,
        action: rule.action,
        config: rule.config,
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      });
    }
  }

  async processInactivityRule(config: Record<string, unknown>) {
    const days = (config.days as number) || 7;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const opportunities = await this.prisma.opportunity.findMany({
      where: {
        updatedAt: { lte: cutoff },
        isEnrolled: false,
        stage: { type: 'NORMAL' },
      },
      include: { contact: true, advisor: true },
    });

    for (const opp of opportunities) {
      if (opp.advisorId) {
        await this.prisma.notification.create({
          data: {
            userId: opp.advisorId,
            title: 'Inactivity Alert',
            message: `Opportunity with ${opp.contact.firstName} ${opp.contact.lastName} has been inactive for ${days} days`,
            type: 'INACTIVITY_ALERT',
            referenceId: opp.id,
          },
        });
      }
    }

    return { processed: opportunities.length };
  }

  async processFollowUpRule(config: Record<string, unknown>) {
    const days = (config.days as number) || 3;
    const stageId = config.stageId as string | undefined;

    const where: any = {
      updatedAt: { lte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
      isEnrolled: false,
    };
    if (stageId) where.stageId = stageId;

    const opportunities = await this.prisma.opportunity.findMany({
      where,
      include: { contact: true, advisor: true },
    });

    for (const opp of opportunities) {
      if (opp.advisorId) {
        await this.prisma.reminder.create({
          data: {
            title: 'Follow-up Reminder',
            description: `Follow up with ${opp.contact.firstName} ${opp.contact.lastName}`,
            reminderDate: new Date(),
            userId: opp.advisorId,
            opportunityId: opp.id,
          },
        });
      }
    }

    return { processed: opportunities.length };
  }

  async processAutoTaskRule(config: Record<string, unknown>) {
    const stageId = config.stageId as string;
    const taskTitle = (config.taskTitle as string) || 'Follow-up task';
    const taskDescription = config.taskDescription as string | undefined;

    if (!stageId) return { processed: 0 };

    const opportunities = await this.prisma.opportunity.findMany({
      where: { stageId, isEnrolled: false },
      include: { contact: true, advisor: true },
    });

    for (const opp of opportunities) {
      if (opp.advisorId) {
        await this.prisma.calendarEvent.create({
          data: {
            title: taskTitle,
            description: taskDescription || `Follow-up with ${opp.contact.firstName} ${opp.contact.lastName}`,
            type: 'TASK',
            startDate: new Date(),
            userId: opp.advisorId,
            opportunityId: opp.id,
          },
        });
      }
    }

    return { processed: opportunities.length };
  }
}
