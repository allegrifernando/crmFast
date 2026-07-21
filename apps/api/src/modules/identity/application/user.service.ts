import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(data: { email: string; password: string; name: string; role: RoleName }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const role = await this.prisma.role.findUnique({ where: { name: data.role } });
    if (!role) {
      throw new NotFoundException(`Role ${data.role} not found`);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        roleId: role.id,
      },
      include: { role: true },
    });

    return this.mapUserResponse(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => this.mapUserResponse(u));
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserResponse(user);
  }

  async update(id: string, data: { email?: string; name?: string; role?: RoleName }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    const updateData: Record<string, unknown> = {};
    if (data.email) updateData.email = data.email;
    if (data.name) updateData.name = data.name;

    if (data.role) {
      const role = await this.prisma.role.findUnique({ where: { name: data.role } });
      if (!role) {
        throw new NotFoundException(`Role ${data.role} not found`);
      }
      updateData.roleId = role.id;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });

    return this.mapUserResponse(updated);
  }

  async deactivate(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: { role: true },
    });

    await this.prisma.session.updateMany({
      where: { userId: id, isRevoked: false },
      data: { isRevoked: true },
    });

    return this.mapUserResponse(updated);
  }

  async getPermissionMatrix() {
    const roles = await this.prisma.role.findMany({
      include: { permissions: true },
    });

    return roles.map((role) => ({
      roleId: role.id,
      roleName: role.name,
      permissions: role.permissions.map((p) => ({
        id: p.id,
        module: p.module,
        action: p.action,
      })),
    }));
  }

  async updatePermissionMatrix(
    roleId: string,
    permissions: { module: string; action: string }[],
  ) {
    await this.prisma.permission.deleteMany({ where: { roleId } });

    await this.prisma.permission.createMany({
      data: permissions.map((p) => ({
        roleId,
        module: p.module,
        action: p.action,
      })),
    });
  }

  private mapUserResponse(user: { id: string; email: string; name: string; role: { name: string }; isActive: boolean; twoFactorEnabled: boolean; createdAt: Date }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      isActive: user.isActive,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
    };
  }
}
