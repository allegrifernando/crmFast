import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Channel } from '@prisma/client';

@Injectable()
export class CampaignService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string; description?: string; channel?: Channel;
    source?: string; cost: number; startDate: string; endDate?: string;
  }) {
    return this.prisma.campaign.create({
      data: {
        name: data.name,
        description: data.description,
        channel: data.channel || 'CAMPAIGN',
        source: data.source,
        cost: data.cost,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    return this.prisma.campaign.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });
  }

  async findById(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        opportunities: { select: { id: true, isEnrolled: true } },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async update(id: string, data: {
    name?: string; description?: string; channel?: Channel; source?: string;
    cost?: number; startDate?: string; endDate?: string; isActive?: boolean;
  }) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.channel) updateData.channel = data.channel;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.cost !== undefined) updateData.cost = data.cost;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.prisma.campaign.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    await this.prisma.campaign.update({ where: { id }, data: { isActive: false } });
    return { message: 'Campaign deactivated' };
  }

  async getMetrics(campaignId?: string) {
    const where: any = {};
    if (campaignId) where.id = campaignId;

    const campaigns = await this.prisma.campaign.findMany({
      where,
      include: {
        opportunities: { select: { id: true, isEnrolled: true } },
      },
    });

    return campaigns.map((c) => {
      const leadsCount = c.opportunities.length;
      const enrollmentsCount = c.opportunities.filter((o) => o.isEnrolled).length;
      const costPerLead = leadsCount > 0 ? c.cost / leadsCount : 0;
      const costPerEnrollment = enrollmentsCount > 0 ? c.cost / enrollmentsCount : 0;
      const roi = c.cost > 0 ? (enrollmentsCount * 1000 - c.cost) / c.cost : 0; // placeholder revenue calc

      return {
        campaignId: c.id,
        campaignName: c.name,
        totalCost: c.cost,
        leadsCount,
        enrollmentsCount,
        costPerLead: Number(costPerLead.toFixed(2)),
        costPerEnrollment: Number(costPerEnrollment.toFixed(2)),
        roi: Number(roi.toFixed(2)),
      };
    });
  }
}