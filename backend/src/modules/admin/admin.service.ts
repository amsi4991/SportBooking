
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private wallet: WalletService
  ) {}

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

  async deleteBooking(bookingId: string) {
    // Verifica che la prenotazione esista
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new NotFoundException('Prenotazione non trovata');
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
}
