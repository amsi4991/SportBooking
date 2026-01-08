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
          balance: 10000, // €100 credito iniziale
        },
      },
    },
  });

  // COURTS
  const court1 = await prisma.court.upsert({
    where: { id: '550e8400-e29b-41d4-a716-446655440000' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Campo Centrale',
      city: 'Milano',
      sport: 'Calcio',
      description: 'Campo da calcio a 5 con erba sintetica - Perfetto per partite amichevoli',
      image: 'https://images.unsplash.com/photo-1552109067-ee91c52ec8d0?w=500&h=300&fit=crop'
    },
  });

  const court2 = await prisma.court.create({
    data: {
      name: 'Tennis Club',
      city: 'Milano',
      sport: 'Tennis',
      description: 'Due campi in cemento con illuminazione notturna',
      image: 'https://images.unsplash.com/photo-1554224311-beee415c15fc?w=500&h=300&fit=crop'
    }
  });

  const court3 = await prisma.court.create({
    data: {
      name: 'Pallavolo Arena',
      city: 'Como',
      sport: 'Pallavolo',
      description: 'Palestra professionale con 3 campi di pallavolo',
      image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=500&h=300&fit=crop'
    }
  });

  // PRICE RULES
  await prisma.priceRule.deleteMany({});
  await prisma.priceRule.createMany({
    data: [
      { courtId: court1.id, weekday: 1, startTime: new Date('2024-01-01T06:00'), endTime: new Date('2024-01-01T23:00'), price: 5000 },
      { courtId: court2.id, weekday: 1, startTime: new Date('2024-01-01T06:00'), endTime: new Date('2024-01-01T23:00'), price: 6000 },
      { courtId: court3.id, weekday: 1, startTime: new Date('2024-01-01T06:00'), endTime: new Date('2024-01-01T23:00'), price: 4000 },
    ]
  });

  console.log('✅ Seed completato');
  console.log({ 
    admin: admin.email, 
    user: user.email,
    courts: [court1.name, court2.name, court3.name]
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

