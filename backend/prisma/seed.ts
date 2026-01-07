import { PrismaClient, Role } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// hash semplice per seed (NON usare questo in produzione)
function hash(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Seeding database...');

  // ADMIN
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.it' },
    update: {},
    create: {
      email: 'admin@test.it',
      password: hash('admin123'),
      role: Role.admin,
      wallet: {
        create: {
          balance: 0,
        },
      },
    },
  });

  // USER
  const user = await prisma.user.upsert({
    where: { email: 'user@test.it' },
    update: {},
    create: {
      email: 'user@test.it',
      password: hash('user123'),
      role: Role.user,
      wallet: {
        create: {
          balance: 100, // credito iniziale
        },
      },
    },
  });

  // COURT
  const court = await prisma.court.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440000' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Campo Centrale',
    },
  });

  console.log('✅ Seed completato');
  console.log({ admin: admin.email, user: user.email, court: court.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
