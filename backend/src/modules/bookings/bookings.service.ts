import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../../database/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { PricingService } from '../pricing/pricing.service';
import { CourtBlocksService } from '../courts/court-blocks.service';

@Injectable()
export class BookingsService {
  private redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

  constructor(
    private prisma: PrismaService,
    private wallet: WalletService,
    private pricing: PricingService,
    private courtBlocks: CourtBlocksService
  ) { }

  async getBookingsByCourtId(courtId: string) {
    return this.prisma.booking.findMany({
      where: { courtId },
      include: {
        court: true,
        user: true
      }
    });
  }

  async createBooking(userId: string, courtId: string, startsAt: Date, endsAt: Date, courtType: 'singolo' | 'doppio', playerIds: string[] = []) {
    // Verifica che la prenotazione non sia nel passato
    const now = new Date();
    if (startsAt < now) {
      throw new ConflictException('Non puoi prenotare orari nel passato');
    }

    if (endsAt <= startsAt) {
      throw new ConflictException('L\'orario di fine deve essere dopo quello di inizio');
    }

    // Verifica se il campo è bloccato in questo orario
    const isBlocked = await this.courtBlocks.isTimeSlotBlocked(courtId, startsAt, endsAt);
    if (isBlocked) {
      throw new ConflictException('Il campo è bloccato durante questo orario');
    }

    const lockKey = `lock:${courtId}:${startsAt.toISOString()}:${endsAt.toISOString()}`;
    const result = await this.redis.set(
      lockKey,
      '1',
      'EX',
      30,
      'NX',
    );

    if (result !== 'OK') {
      throw new ConflictException('Slot occupato');
    }

    try {
      const price = await this.pricing.calculate(courtId, startsAt, endsAt);
      await this.wallet.spend(userId, price);

      const booking = await this.prisma.booking.create({
        data: {
          userId,
          courtId,
          startsAt,
          endsAt,
          courtType,
          totalPrice: price,
          paidWithWallet: true
        }
      });

      // Aggiungi i giocatori selezionati
      if (playerIds && playerIds.length > 0) {
        await this.prisma.bookingPlayer.createMany({
          data: playerIds.map(playerId => ({
            bookingId: booking.id,
            userId: playerId
          }))
        });
      }

      return booking;
    } finally {
      await this.redis.del(lockKey);
    }
  }

  async deleteBooking(userId: string, bookingId: string) {
    // Verifica che la prenotazione esista e appartenga all'utente
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new NotFoundException('Prenotazione non trovata');
    }

    if (booking.userId !== userId) {
      throw new ForbiddenException('Non puoi eliminare prenotazioni di altri utenti');
    }

    // Elimina la prenotazione
    await this.prisma.booking.delete({
      where: { id: bookingId }
    });

    // Rimborsa il credito nel wallet
    await this.wallet.addCredit(userId, booking.totalPrice);

    return { message: 'Prenotazione eliminata e credito rimborsato', refundAmount: booking.totalPrice };
  }
}
