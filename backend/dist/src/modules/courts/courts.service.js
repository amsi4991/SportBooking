"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourtsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let CourtsService = class CourtsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listCourts(filters) {
        return this.prisma.court.findMany({
            where: {
                ...(filters.city && { city: { contains: filters.city, mode: 'insensitive' } }),
                ...(filters.sport && { sport: { contains: filters.sport, mode: 'insensitive' } }),
            },
            include: {
                priceRules: {
                    take: 1,
                    orderBy: { price: 'asc' }
                }
            }
        });
    }
    async getCourtById(id) {
        return this.prisma.court.findUnique({
            where: { id },
            include: {
                priceRules: true,
                bookings: {
                    where: {
                        startsAt: {
                            gte: new Date()
                        }
                    },
                    select: {
                        id: true,
                        startsAt: true,
                        endsAt: true
                    }
                }
            }
        });
    }
    async getAvailableSlots(courtId, date) {
        const bookings = await this.prisma.booking.findMany({
            where: {
                courtId,
                startsAt: {
                    gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
                    lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
                }
            }
        });
        const slots = [];
        for (let hour = 6; hour < 23; hour++) {
            const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0);
            const end = new Date(start.getTime() + 60 * 60 * 1000);
            const isBooked = bookings.some(b => b.startsAt <= start && b.endsAt > start);
            slots.push({
                start: start.toISOString(),
                end: end.toISOString(),
                available: !isBooked
            });
        }
        return slots;
    }
};
exports.CourtsService = CourtsService;
exports.CourtsService = CourtsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CourtsService);
