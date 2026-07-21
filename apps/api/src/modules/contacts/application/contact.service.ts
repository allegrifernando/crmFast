import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Channel } from '@prisma/client';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    identityDocument?: string;
    identityType?: string;
    city?: string;
    notes?: string;
    channel?: Channel;
  }) {
    const existing = await this.findExisting(data);
    if (existing) {
      const opportunitiesCount = await this.prisma.opportunity.count({
        where: { contactId: existing.id },
      });
      return { contact: existing, duplicated: true, opportunitiesCount };
    }

    const isPotentialDuplicate = await this.checkPotentialDuplicate(data);

    const contact = await this.prisma.contact.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        identityDocument: data.identityDocument,
        identityType: data.identityType,
        city: data.city,
        notes: data.notes,
        channel: data.channel || 'MANUAL',
        isDuplicate: isPotentialDuplicate,
      },
    });

    return { contact, duplicated: false };
  }

  private async findExisting(data: {
    email?: string;
    identityDocument?: string;
    identityType?: string;
  }) {
    if (data.identityDocument && data.identityType) {
      const byDoc = await this.prisma.contact.findFirst({
        where: { identityDocument: data.identityDocument, identityType: data.identityType },
      });
      if (byDoc) return byDoc;
    }

    if (data.email) {
      const byEmail = await this.prisma.contact.findFirst({
        where: { email: data.email },
      });
      if (byEmail) return byEmail;
    }

    return null;
  }

  private async checkPotentialDuplicate(data: {
    phone?: string;
    firstName?: string;
    lastName?: string;
  }) {
    if (data.phone) {
      const byPhone = await this.prisma.contact.findFirst({
        where: { phone: data.phone },
      });
      if (byPhone) return true;
    }

    return false;
  }

  async findAll(search?: string, page = 1, limit = 20) {
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { identityDocument: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { opportunities: true } } },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findById(id: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id },
      include: {
        opportunities: {
          include: { program: true, stage: true, advisor: { select: { id: true, name: true } } },
        },
      },
    });
    if (!contact) throw new NotFoundException('Contact not found');
    return contact;
  }

  async update(id: string, data: { firstName?: string; lastName?: string; email?: string; phone?: string; identityDocument?: string; identityType?: string; city?: string; notes?: string }) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException('Contact not found');
    return this.prisma.contact.update({ where: { id }, data });
  }

  async markDuplicate(id: string, duplicateOfId: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException('Contact not found');
    const duplicateOf = await this.prisma.contact.findUnique({ where: { id: duplicateOfId } });
    if (!duplicateOf) throw new NotFoundException('Original contact not found');

    return this.prisma.contact.update({
      where: { id },
      data: { isDuplicate: true, duplicateOfId },
    });
  }
}
