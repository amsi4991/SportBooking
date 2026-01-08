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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const wallet_service_1 = require("../wallet/wallet.service");
let AdminService = class AdminService {
    constructor(prisma, wallet) {
        this.prisma = prisma;
        this.wallet = wallet;
    }
    async getStats() {
        const totalBookings = await this.prisma.booking.count();
        const revenueAgg = await this.prisma.booking.aggregate({
            _sum: { totalPrice: true }
        });
        return {
            totalBookings,
            revenue: revenueAgg._sum.totalPrice || 0
        };
    }
    async listBookings() {
        return this.prisma.booking.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }
    async listUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true
            }
        });
    }
    async deleteBooking(bookingId) {
        // Verifica che la prenotazione esista
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId }
        });
        if (!booking) {
            throw new common_1.NotFoundException('Prenotazione non trovata');
        }
        // Elimina la prenotazione
        await this.prisma.booking.delete({
            where: { id: bookingId }
        });
        // Rimborsa il credito nel wallet dell'utente
        await this.wallet.addCredit(booking.userId, booking.totalPrice);
        return {
            message: 'Prenotazione eliminata e credito rimborsato all\'utente',
            refundAmount: booking.totalPrice,
            userEmail: booking.userId
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        wallet_service_1.WalletService])
], AdminService);
