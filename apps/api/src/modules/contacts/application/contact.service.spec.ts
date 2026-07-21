import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from './contact.service';
import { PrismaService } from '../../../prisma/prisma.service';

describe('ContactService', () => {
  let service: ContactService;
  let prisma: any;

  const mockContact = {
    id: 'c-1', firstName: 'Juan', lastName: 'Pérez',
    email: 'juan@test.com', phone: '77712345',
    identityDocument: '123456', identityType: 'CI',
    channel: 'MANUAL', isDuplicate: false, createdAt: new Date(), updatedAt: new Date(),
    opportunities: [],
  };

  beforeEach(async () => {
    prisma = {
      contact: {
        findFirst: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(),
        create: jest.fn(), update: jest.fn(), count: jest.fn(),
      },
      opportunity: { count: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ContactService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ContactService>(ContactService);
  });

  it('should create a contact', async () => {
    prisma.contact.findFirst.mockResolvedValue(null);
    prisma.contact.create.mockResolvedValue(mockContact);

    const result = await service.create({ firstName: 'Juan', lastName: 'Pérez', email: 'juan@test.com' });
    expect(result.contact.firstName).toBe('Juan');
    expect(result.duplicated).toBe(false);
  });

  it('should detect existing by identity document', async () => {
    prisma.contact.findFirst.mockResolvedValue(mockContact);
    prisma.opportunity.count.mockResolvedValue(2);

    const result = await service.create({
      firstName: 'Juan', lastName: 'Pérez',
      identityDocument: '123456', identityType: 'CI',
    });
    expect(result.duplicated).toBe(true);
    expect(result.opportunitiesCount).toBe(2);
  });

  it('should detect potential duplicate by phone', async () => {
    prisma.contact.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockContact);
    prisma.contact.create.mockResolvedValue({ ...mockContact, isDuplicate: true });

    const result = await service.create({ firstName: 'Juan', lastName: 'Pérez', phone: '77712345' });
    expect(result.contact.isDuplicate).toBe(true);
  });
});
