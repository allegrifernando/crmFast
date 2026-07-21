import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const MODULES = [
  'users',
  'opportunities',
  'contacts',
  'catalog',
  'activities',
  'agenda',
  'automations',
  'campaigns',
  'reporting',
  'documents',
  'notifications',
];

const ACTIONS = ['create', 'read', 'update', 'delete', 'manage'];

const ROLE_PERMISSIONS: Record<RoleName, { module: string; action: string }[]> = {
  ADMIN: MODULES.flatMap((m) => ACTIONS.map((a) => ({ module: m, action: a }))),
  DIRECTOR: MODULES.flatMap((m) =>
    ['read', 'update', 'manage'].map((a) => ({ module: m, action: a })),
  ),
  SUPERVISOR: [
    ...MODULES.filter((m) => !['automations', 'campaigns', 'notifications'].includes(m)).flatMap(
      (m) => ['read', 'update'].map((a) => ({ module: m, action: a })),
    ),
    { module: 'opportunities', action: 'manage' },
    { module: 'activities', action: 'create' },
    { module: 'activities', action: 'read' },
  ],
  ADVISOR: [
    { module: 'opportunities', action: 'read' },
    { module: 'opportunities', action: 'update' },
    { module: 'contacts', action: 'create' },
    { module: 'contacts', action: 'read' },
    { module: 'contacts', action: 'update' },
    { module: 'activities', action: 'create' },
    { module: 'activities', action: 'read' },
    { module: 'agenda', action: 'read' },
    { module: 'agenda', action: 'update' },
    { module: 'documents', action: 'create' },
    { module: 'documents', action: 'read' },
  ],
};

async function seed() {
  console.log('Seeding database...');

  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName as RoleName },
      update: { description: `${roleName} role` },
      create: {
        name: roleName as RoleName,
        description: `${roleName} role`,
      },
    });

    await prisma.permission.deleteMany({ where: { roleId: role.id } });
    await prisma.permission.createMany({
      data: permissions.map((p) => ({
        roleId: role.id,
        module: p.module,
        action: p.action,
      })),
    });

    console.log(`  ${roleName}: ${permissions.length} permissions`);
  }

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });

  const adminEmail = 'admin@crmfast.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin',
        roleId: adminRole!.id,
      },
    });
    console.log('  Admin user created: admin@crmfast.com / admin123');
  }

  const stagesCount = await prisma.pipelineStage.count();
  if (stagesCount === 0) {
    const defaultStages = [
      { name: 'Nuevo', order: 0, type: 'NORMAL' as const },
      { name: 'Contactado', order: 1, type: 'NORMAL' as const },
      { name: 'Interesado', order: 2, type: 'NORMAL' as const },
      { name: 'Cita Agendada', order: 3, type: 'NORMAL' as const },
      { name: 'Entrevista', order: 4, type: 'NORMAL' as const },
      { name: 'Documentación', order: 5, type: 'NORMAL' as const },
      { name: 'Oferta Enviada', order: 6, type: 'NORMAL' as const },
      { name: 'Negociación', order: 7, type: 'NORMAL' as const },
      { name: 'En Proceso de Pago', order: 8, type: 'NORMAL' as const },
      { name: 'Matriculado', order: 9, type: 'TERMINAL_ENROLLED' as const },
      { name: 'No Interesado', order: 10, type: 'TERMINAL_NOT_INTERESTED' as const },
      { name: 'Perdido', order: 11, type: 'TERMINAL_LOST' as const },
    ];
    await prisma.pipelineStage.createMany({ data: defaultStages });
    console.log('  Default pipeline stages created (12 stages)');
  }

  console.log('Seed completed.');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
