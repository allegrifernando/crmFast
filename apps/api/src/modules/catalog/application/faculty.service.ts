import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FacultyService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; code: string; description?: string }) {
    const existing = await this.prisma.faculty.findUnique({ where: { code: data.code } });
    if (existing) {
      throw new ConflictException('Faculty code already exists');
    }

    return this.prisma.faculty.create({ data });
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    return this.prisma.faculty.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id },
      include: { programs: true },
    });
    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }
    return faculty;
  }

  async update(id: string, data: { name?: string; code?: string; description?: string; isActive?: boolean }) {
    const faculty = await this.prisma.faculty.findUnique({ where: { id } });
    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }

    if (data.code && data.code !== faculty.code) {
      const existing = await this.prisma.faculty.findUnique({ where: { code: data.code } });
      if (existing) {
        throw new ConflictException('Faculty code already exists');
      }
    }

    return this.prisma.faculty.update({ where: { id }, data });
  }

  async remove(id: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { id },
      include: { programs: { take: 1 } },
    });
    if (!faculty) {
      throw new NotFoundException('Faculty not found');
    }
    if (faculty.programs.length > 0) {
      await this.prisma.faculty.update({
        where: { id },
        data: { isActive: false },
      });
      return { message: 'Faculty deactivated (has associated programs)' };
    }

    await this.prisma.faculty.delete({ where: { id } });
    return { message: 'Faculty deleted' };
  }
}
