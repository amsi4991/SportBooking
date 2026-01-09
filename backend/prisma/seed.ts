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
      firstName: 'Admin',
      lastName: 'User',
      role: Role.admin
    },
  });

  // USER
  const user = await prisma.user.upsert({
    where: { email: 'user@test.it' },
    update: {},
    create: {
      email: 'user@test.it',
      password: hash('user123'),
      firstName: 'Marco',
      lastName: 'Rossi',
      phone: '+39 123 456 7890',
      city: 'Milano',
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

  const court2 = await prisma.court.upsert({
    where: { id: '560e8400-e29b-41d4-a716-446655440000' },
    update: {},
    create: {
      id: '560e8400-e29b-41d4-a716-446655440000',
      name: 'Tennis Club',
      city: 'Milano',
      sport: 'Tennis',
      description: 'Due campi in cemento con illuminazione notturna',
      image: 'https://images.unsplash.com/photo-1554224311-beee415c15fc?w=500&h=300&fit=crop'
    }
  });

  const court3 = await prisma.court.upsert({
    where: { id: '570e8400-e29b-41d4-a716-446655440000' },
    update: {},
    create: {
      id: '570e8400-e29b-41d4-a716-446655440000',
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
      { courtId: court1.id, weekdays: [0, 1, 2, 3, 4], startTime: '06:00', endTime: '23:00', price: 5000 },
      { courtId: court1.id, weekdays: [5, 6], startTime: '06:00', endTime: '23:00', price: 7500 },
      { courtId: court2.id, weekdays: [0, 1, 2, 3, 4], startTime: '06:00', endTime: '23:00', price: 6000 },
      { courtId: court2.id, weekdays: [5, 6], startTime: '06:00', endTime: '23:00', price: 8000 },
      { courtId: court3.id, weekdays: [0, 1, 2, 3, 4, 5, 6], startTime: '06:00', endTime: '23:00', price: 4000 },
    ]
  });

  console.log('✅ Seed completato');
  console.log({ 
    admin: admin.email, 
    user: user.email,
    courts: [court1.name, court2.name, court3.name]
  });

  // APP SETTINGS - Valori iniziali
  await prisma.appSettings.upsert({
    where: { key: 'brandSettings' },
    update: {},
    create: {
      key: 'brandSettings',
      value: { icon: '⚽', name: 'SportBook' },
    },
  });

  await prisma.appSettings.upsert({
    where: { key: 'dashboardSettings' },
    update: {},
    create: {
      key: 'dashboardSettings',
      value: { 
        availabilityText: '7 giorni a settimana',
        hoursText: '06:00 - 22:00'
      },
    },
  });

  console.log('✅ Settings inizializzati');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

