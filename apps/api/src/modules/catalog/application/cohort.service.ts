import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CohortService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    programId: string;
    startDate: string;
    endDate?: string;
    enrollmentStartDate?: string;
    enrollmentEndDate?: string;
    quota?: number;
  }) {
    const program = await this.prisma.program.findUnique({ where: { id: data.programId } });
    if (!program) {
      throw new NotFoundException('Program not found');
    }

    return this.prisma.cohort.create({
      data: {
        name: data.name,
        programId: data.programId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        enrollmentStartDate: data.enrollmentStartDate ? new Date(data.enrollmentStartDate) : null,
        enrollmentEndDate: data.enrollmentEndDate ? new Date(data.enrollmentEndDate) : null,
        quota: data.quota,
      },
      include: { program: true },
    });
  }

  async findByProgram(programId: string, includeInactive = false) {
    const where: any = { programId };
    if (!includeInactive) where.isActive = true;

    return this.prisma.cohort.findMany({
      where,
      include: { program: true },
      orderBy: { startDate: 'asc' },
    });
  }

  async findById(id: string) {
    const cohort = await this.prisma.cohort.findUnique({
      where: { id },
      include: { program: { include: { faculty: true } } },
    });
    if (!cohort) {
      throw new NotFoundException('Cohort not found');
    }
    return cohort;
  }

  async update(
    id: string,
    data: {
      name?: string;
      startDate?: string;
      endDate?: string;
      enrollmentStartDate?: string;
      enrollmentEndDate?: string;
      quota?: number;
      isActive?: boolean;
    },
  ) {
    const cohort = await this.prisma.cohort.findUnique({ where: { id } });
    if (!cohort) {
      throw new NotFoundException('Cohort not found');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.enrollmentStartDate !== undefined)
      updateData.enrollmentStartDate = data.enrollmentStartDate ? new Date(data.enrollmentStartDate) : null;
    if (data.enrollmentEndDate !== undefined)
      updateData.enrollmentEndDate = data.enrollmentEndDate ? new Date(data.enrollmentEndDate) : null;
    if (data.quota !== undefined) updateData.quota = data.quota;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.prisma.cohort.update({
      where: { id },
      data: updateData,
      include: { program: true },
    });
  }

  async remove(id: string) {
    const cohort = await this.prisma.cohort.findUnique({ where: { id } });
    if (!cohort) {
      throw new NotFoundException('Cohort not found');
    }

    await this.prisma.cohort.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Cohort deactivated' };
  }
}
