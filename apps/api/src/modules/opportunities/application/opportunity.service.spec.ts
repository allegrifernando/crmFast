import { Test, TestingModule } from '@nestjs/testing';
import { OpportunityService } from './opportunity.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AssignmentService } from '../../assignment/application/assignment.service';
import { NotFoundException } from '@nestjs/common';

describe('OpportunityService', () => {
  let service: OpportunityService;
  let prisma: any;
  let assignment: any;

  const mockStage = { id: 'st-1', name: 'Nuevo', order: 0, type: 'NORMAL', isActive: true };
  const mockContact = { id: 'c-1', firstName: 'Juan', lastName: 'Pérez' };
  const mockProgram = { id: 'p-1', name: 'Programa', code: 'P' };

  beforeEach(async () => {
    prisma = {
      contact: { findUnique: jest.fn() },
      program: { findUnique: jest.fn() },
      cohort: { findUnique: jest.fn() },
      pipelineStage: { findFirst: jest.fn(), findUnique: jest.fn() },
      opportunity: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
      stageHistory: { create: jest.fn() },
      activityEvent: { create: jest.fn() },
      auditLog: { create: jest.fn() },
    };

    assignment = {
      roundRobinAssign: jest.fn(),
      reassignOpportunity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpportunityService,
        { provide: PrismaService, useValue: prisma },
        { provide: AssignmentService, useValue: assignment },
      ],
    }).compile();

    service = module.get<OpportunityService>(OpportunityService);
  });

  it('should create an opportunity', async () => {
    prisma.contact.findUnique.mockResolvedValue(mockContact);
    prisma.program.findUnique.mockResolvedValue(mockProgram);
    prisma.pipelineStage.findFirst.mockResolvedValue(mockStage);
    assignment.roundRobinAssign.mockResolvedValue('adv-1');
    prisma.opportunity.create.mockResolvedValue({
      id: 'opp-1', contactId: 'c-1', programId: 'p-1',
      stageId: 'st-1', advisorId: 'adv-1', isEnrolled: false,
      channel: 'MANUAL', contact: mockContact, program: mockProgram,
      stage: mockStage, advisor: { id: 'adv-1', name: 'Advisor' },
      cohort: null, createdAt: new Date(),
    });

    const result = await service.create({ contactId: 'c-1', programId: 'p-1' });
    expect(result.id).toBe('opp-1');
    expect(result.advisorId).toBe('adv-1');
  });

  it('should throw if contact not found', async () => {
    prisma.contact.findUnique.mockResolvedValue(null);
    await expect(service.create({ contactId: 'bad', programId: 'p-1' })).rejects.toThrow(NotFoundException);
  });

  it('should change stage', async () => {
    prisma.opportunity.findUnique
      .mockResolvedValueOnce({ id: 'opp-1', stageId: 'st-1', stage: mockStage, contact: mockContact, program: mockProgram })
      .mockResolvedValueOnce({ id: 'opp-1', stageId: 'st-2', cohortId: null });
    prisma.pipelineStage.findUnique.mockResolvedValue({ id: 'st-2', name: 'Interesado', type: 'NORMAL', isActive: true });
    prisma.opportunity.update.mockResolvedValue({});

    const result = await service.changeStage('opp-1', 'st-2', 'actor-1');
    expect(result).toBeDefined();
  });

  it('should enroll an opportunity', async () => {
    prisma.opportunity.findUnique
      .mockResolvedValueOnce({ id: 'opp-1', stageId: 'st-1', stage: mockStage })
      .mockResolvedValueOnce({ id: 'opp-1', isEnrolled: true });
    prisma.pipelineStage.findFirst.mockResolvedValue({ id: 'st-enrolled', name: 'Matriculado', type: 'TERMINAL_ENROLLED' });
    prisma.opportunity.update.mockResolvedValue({});

    const result = await service.enroll('opp-1', 'Enrolled via test', 'actor-1');
    expect(result).toBeDefined();
  });
});
