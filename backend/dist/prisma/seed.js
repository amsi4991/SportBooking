"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
const prisma = new client_1.PrismaClient();
// hash semplice per seed (NON usare questo in produzione)
function hash(password) {
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
            role: client_1.Role.admin,
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
            role: client_1.Role.user,
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
    // PRICE RULES - Create rules for all days of the week
    await prisma.priceRule.deleteMany({});
    const priceRulesData = [];
    // Create rules for each day (0=Sunday to 6=Saturday)
    for (let day = 0; day < 7; day++) {
        priceRulesData.push({ courtId: court1.id, weekday: day, startTime: new Date('2024-01-01T06:00'), endTime: new Date('2024-01-01T23:00'), price: 5000 }, { courtId: court2.id, weekday: day, startTime: new Date('2024-01-01T06:00'), endTime: new Date('2024-01-01T23:00'), price: 6000 }, { courtId: court3.id, weekday: day, startTime: new Date('2024-01-01T06:00'), endTime: new Date('2024-01-01T23:00'), price: 4000 });
    }
    await prisma.priceRule.createMany({
        data: priceRulesData
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
