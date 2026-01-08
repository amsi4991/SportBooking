
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import * as argon2 from 'argon2';

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
        role: true,
        wallet: {
          select: {
            balance: true
          }
        }
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
    await this.wallet.refund(booking.userId, booking.totalPrice, `Rimborso prenotazione cancellata da admin`);

    return { 
      message: 'Prenotazione eliminata e credito rimborsato all\'utente', 
      refundAmount: booking.totalPrice,
      userEmail: booking.userId
    };
  }

  async getWalletTransactions(limit: number = 100) {
    return this.prisma.transaction.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async createUser(email: string, password: string, firstName?: string, lastName?: string) {
    // Verifica che l'email non esista già
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new BadRequestException('Email già in uso');
    }

    // Hash della password
    const hashedPassword = await argon2.hash(password);

    // Crea l'utente
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || '',
        lastName: lastName || '',
        wallet: {
          create: {
            balance: 0
          }
        }
      },
      include: {
        wallet: true
      }
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      wallet: user.wallet
    };
  }

  async updateUserWallet(userId: string, amount: number, operation: 'add' | 'subtract', description?: string) {
    // Validazione input
    if (!userId) {
      throw new BadRequestException('User ID mancante');
    }

    if (!amount || amount <= 0) {
      throw new BadRequestException('Importo non valido');
    }

    if (!operation || !['add', 'subtract'].includes(operation)) {
      throw new BadRequestException('Operazione non valida');
    }

    // Converti da euro a centesimi
    const amountInCents = Math.round(amount * 100);

    // Verifica che l'utente esista
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });

    if (!user) {
      throw new NotFoundException('Utente non trovato');
    }

    if (!user.wallet) {
      throw new NotFoundException('Wallet non trovato');
    }

    if (operation === 'subtract' && user.wallet.balance < amountInCents) {
      throw new BadRequestException('Credito insufficiente nel wallet');
    }

    let updatedWallet;
    try {
      if (operation === 'add') {
        updatedWallet = await this.wallet.addCredit(userId, amountInCents, description || 'Caricamento credito da admin');
      } else {
        updatedWallet = await this.wallet.spend(userId, amountInCents, description || 'Decurtazione credito da admin');
      }
    } catch (error) {
      console.error('Errore aggiornamento wallet:', error);
      throw new BadRequestException(`Errore nell'aggiornamento del wallet: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }

    return updatedWallet;
  }

  async getUserWithWallet(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true
      }
    });
  }
}
