import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { StageType } from '@prisma/client';

const TERMINAL_STAGES: StageType[] = ['TERMINAL_ENROLLED', 'TERMINAL_NOT_INTERESTED', 'TERMINAL_LOST'] as const;

@Injectable()
export class PipelineService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; order: number; type?: StageType }) {
    return this.prisma.pipelineStage.create({ data: { name: data.name, order: data.order, type: data.type || 'NORMAL' } });
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    return this.prisma.pipelineStage.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  async update(id: string, data: { name?: string; order?: number; isActive?: boolean }) {
    const stage = await this.prisma.pipelineStage.findUnique({ where: { id } });
    if (!stage) throw new NotFoundException('Stage not found');

    if (data.name && stage.type !== 'NORMAL') {
      throw new BadRequestException(`Cannot rename terminal stage: ${stage.type}`);
    }

    return this.prisma.pipelineStage.update({ where: { id }, data });
  }

  async remove(id: string) {
    const stage = await this.prisma.pipelineStage.findUnique({
      where: { id },
      include: { opportunities: { take: 1 } },
    });
    if (!stage) throw new NotFoundException('Stage not found');

    if (stage.type !== 'NORMAL') {
      throw new BadRequestException('Cannot delete a terminal stage');
    }

    if (stage.opportunities.length > 0) {
      return this.prisma.pipelineStage.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return this.prisma.pipelineStage.delete({ where: { id } });
  }

  async seedDefaultStages() {
    const existing = await this.prisma.pipelineStage.count();
    if (existing > 0) return;

    const defaultStages = [
      { name: 'Nuevo', order: 0, type: 'NORMAL' as StageType },
      { name: 'Contactado', order: 1, type: 'NORMAL' as StageType },
      { name: 'Interesado', order: 2, type: 'NORMAL' as StageType },
      { name: 'Cita Agendada', order: 3, type: 'NORMAL' as StageType },
      { name: 'Entrevista', order: 4, type: 'NORMAL' as StageType },
      { name: 'Documentación', order: 5, type: 'NORMAL' as StageType },
      { name: 'Oferta Enviada', order: 6, type: 'NORMAL' as StageType },
      { name: 'Negociación', order: 7, type: 'NORMAL' as StageType },
      { name: 'En Proceso de Pago', order: 8, type: 'NORMAL' as StageType },
      { name: 'Matriculado', order: 9, type: 'TERMINAL_ENROLLED' as StageType },
      { name: 'No Interesado', order: 10, type: 'TERMINAL_NOT_INTERESTED' as StageType },
      { name: 'Perdido', order: 11, type: 'TERMINAL_LOST' as StageType },
    ];

    await this.prisma.pipelineStage.createMany({ data: defaultStages });
  }
}
