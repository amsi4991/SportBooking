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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const prisma_service_1 = require("../../database/prisma.service");
const wallet_service_1 = require("../wallet/wallet.service");
const pricing_service_1 = require("../pricing/pricing.service");
let BookingsService = class BookingsService {
    constructor(prisma, wallet, pricing) {
        this.prisma = prisma;
        this.wallet = wallet;
        this.pricing = pricing;
        this.redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://redis:6379');
    }
    async getBookingsByCourtId(courtId) {
        return this.prisma.booking.findMany({
            where: { courtId },
            include: {
                court: true,
                user: true
            }
        });
    }
    async createBooking(userId, courtId, startsAt, endsAt) {
        const lockKey = `lock:${courtId}:${startsAt.toISOString()}:${endsAt.toISOString()}`;
        const result = await this.redis.set(lockKey, '1', 'EX', 30, 'NX');
        if (result !== 'OK') {
            throw new common_1.ConflictException('Slot occupato');
        }
        try {
            const price = await this.pricing.calculate(courtId, startsAt, endsAt);
            await this.wallet.spend(userId, price);
            return await this.prisma.booking.create({
                data: {
                    userId,
                    courtId,
                    startsAt,
                    endsAt,
                    totalPrice: price,
                    paidWithWallet: true
                }
            });
        }
        finally {
            await this.redis.del(lockKey);
        }
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService,
        pricing_service_1.PricingService])
], BookingsService);
