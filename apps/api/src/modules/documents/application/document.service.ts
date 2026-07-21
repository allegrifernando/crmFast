import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { DocumentType, DocumentStatus } from '@prisma/client';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async upload(data: {
    opportunityId: string;
    type: DocumentType;
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    mimeType?: string;
    notes?: string;
    uploadedById: string;
  }) {
    const opp = await this.prisma.opportunity.findUnique({ where: { id: data.opportunityId } });
    if (!opp) throw new NotFoundException('Opportunity not found');

    return this.prisma.opportunityDocument.create({ data });
  }

  async findByOpportunity(opportunityId: string) {
    return this.prisma.opportunityDocument.findMany({
      where: { opportunityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const doc = await this.prisma.opportunityDocument.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async updateStatus(id: string, status: DocumentStatus, notes?: string) {
    const doc = await this.findById(id);
    return this.prisma.opportunityDocument.update({
      where: { id },
      data: { status, notes: notes ?? doc.notes },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.opportunityDocument.delete({ where: { id } });
  }

  async getMissingDocuments(opportunityId: string): Promise<DocumentType[]> {
    const opp = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { documents: { select: { type: true } } },
    });
    if (!opp) throw new NotFoundException('Opportunity not found');

    const uploadedTypes = new Set(opp.documents.map((d) => d.type));
    const requiredTypes: DocumentType[] = [
      DocumentType.IDENTITY_DOCUMENT,
      DocumentType.ACADEMIC_CERTIFICATE,
      DocumentType.DIPLOMA,
    ];

    return requiredTypes.filter((t) => !uploadedTypes.has(t));
  }
}
