import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { DocumentType, DocumentStatus } from '@prisma/client';

describe('DocumentService', () => {
  let service: DocumentService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      opportunityDocument: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      opportunity: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should upload document', async () => {
    prisma.opportunity.findUnique.mockResolvedValue({ id: 'opp-1' });
    prisma.opportunityDocument.create.mockResolvedValue({
      id: 'doc-1', opportunityId: 'opp-1', type: DocumentType.IDENTITY_DOCUMENT, fileName: 'dni.pdf', fileUrl: 'https://cdn.example.com/dni.pdf',
    });

    const result = await service.upload({
      opportunityId: 'opp-1', type: DocumentType.IDENTITY_DOCUMENT, fileName: 'dni.pdf', fileUrl: 'https://cdn.example.com/dni.pdf', uploadedById: 'usr-1',
    });
    expect(result.id).toBe('doc-1');
  });

  it('should throw on upload to nonexistent opportunity', async () => {
    prisma.opportunity.findUnique.mockResolvedValue(null);
    await expect(service.upload({
      opportunityId: 'bad-opp', type: DocumentType.OTHER, fileName: 'x.pdf', fileUrl: 'x', uploadedById: 'usr-1',
    })).rejects.toThrow(NotFoundException);
  });

  it('should list documents by opportunity', async () => {
    prisma.opportunityDocument.findMany.mockResolvedValue([
      { id: 'doc-1', type: DocumentType.DIPLOMA },
    ]);
    const result = await service.findByOpportunity('opp-1');
    expect(result).toHaveLength(1);
  });

  it('should throw on document not found', async () => {
    prisma.opportunityDocument.findUnique.mockResolvedValue(null);
    await expect(service.findById('bad-id')).rejects.toThrow(NotFoundException);
  });

  it('should update document status', async () => {
    prisma.opportunityDocument.findUnique.mockResolvedValue({ id: 'doc-1', status: DocumentStatus.PENDING });
    prisma.opportunityDocument.update.mockResolvedValue({ id: 'doc-1', status: DocumentStatus.APPROVED });
    const result = await service.updateStatus('doc-1', DocumentStatus.APPROVED);
    expect(result.status).toBe(DocumentStatus.APPROVED);
  });

  it('should delete document', async () => {
    prisma.opportunityDocument.findUnique.mockResolvedValue({ id: 'doc-1' });
    prisma.opportunityDocument.delete.mockResolvedValue({ id: 'doc-1' });
    const result = await service.remove('doc-1');
    expect(result.id).toBe('doc-1');
  });

  it('should return missing document types', async () => {
    prisma.opportunity.findUnique.mockResolvedValue({
      id: 'opp-1',
      documents: [{ type: DocumentType.IDENTITY_DOCUMENT }],
    });
    const missing = await service.getMissingDocuments('opp-1');
    expect(missing).toContain(DocumentType.ACADEMIC_CERTIFICATE);
    expect(missing).toContain(DocumentType.DIPLOMA);
    expect(missing).not.toContain(DocumentType.IDENTITY_DOCUMENT);
  });
});
