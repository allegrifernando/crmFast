import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Modality } from '@prisma/client';

@Injectable()
export class ProgramService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    name: string;
    code: string;
    description?: string;
    facultyId: string;
    modality: Modality;
    durationMonths?: number;
    price?: number;
    hasScholarship?: boolean;
    scholarshipInfo?: string;
    quota?: number;
  }) {
    const faculty = await this.prisma.faculty.findUnique({ where: { id: data.facultyId } });
    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }

    const existing = await this.prisma.program.findUnique({ where: { code: data.code } });
    if (existing) {
      throw new ConflictException('Program code already exists');
    }

    return this.prisma.program.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        facultyId: data.facultyId,
        modality: data.modality,
        durationMonths: data.durationMonths,
        price: data.price || 0,
        hasScholarship: data.hasScholarship || false,
        scholarshipInfo: data.scholarshipInfo,
        quota: data.quota,
      },
      include: { faculty: true },
    });
  }

  async findAll(filters: { facultyId?: string; modality?: Modality; includeInactive?: boolean }) {
    const where: any = {};
    if (!filters.includeInactive) where.isActive = true;
    if (filters.facultyId) where.facultyId = filters.facultyId;
    if (filters.modality) where.modality = filters.modality;

    return this.prisma.program.findMany({
      where,
      include: { faculty: true, cohorts: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: { faculty: true, cohorts: { where: { isActive: true }, orderBy: { startDate: 'asc' } } },
    });
    if (!program) {
      throw new NotFoundException('Program not found');
    }
    return program;
  }

  async update(
    id: string,
    data: {
      name?: string;
      code?: string;
      description?: string;
      facultyId?: string;
      modality?: Modality;
      durationMonths?: number;
      price?: number;
      hasScholarship?: boolean;
      scholarshipInfo?: string;
      quota?: number;
      isActive?: boolean;
    },
  ) {
    const program = await this.prisma.program.findUnique({ where: { id } });
    if (!program) {
      throw new NotFoundException('Program not found');
    }

    if (data.facultyId) {
      const faculty = await this.prisma.faculty.findUnique({ where: { id: data.facultyId } });
      if (!faculty) {
        throw new NotFoundException('Faculty not found');
      }
    }

    if (data.code && data.code !== program.code) {
      const existing = await this.prisma.program.findUnique({ where: { code: data.code } });
      if (existing) {
        throw new ConflictException('Program code already exists');
      }
    }

    return this.prisma.program.update({
      where: { id },
      data,
      include: { faculty: true },
    });
  }

  async remove(id: string) {
    const program = await this.prisma.program.findUnique({ where: { id } });
    if (!program) {
      throw new NotFoundException('Program not found');
    }

    await this.prisma.program.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Program deactivated' };
  }
}
