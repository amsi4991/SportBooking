
import { Injectable, ConflictException } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../../database/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { PricingService } from '../pricing/pricing.service';

@Injectable()
export class BookingsService {
  private redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

  constructor(
    private prisma: PrismaService,
    private wallet: WalletService,
    private pricing: PricingService
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

  async createBooking(userId: string, courtId: string, startsAt: Date, endsAt: Date) {
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
    } finally {
      await this.redis.del(lockKey);
    }
  }
}
