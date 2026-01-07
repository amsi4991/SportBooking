
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async calculate(courtId: string, startsAt: Date, endsAt: Date): Promise<number> {
    const weekday = startsAt.getUTCDay();
    const rule = await this.prisma.priceRule.findFirst({
      where: {
        courtId,
        weekday,
        startTime: { lte: startsAt },
        endTime: { gte: endsAt }
      }
    });
    return rule ? Number(rule.price) : 0;
  }
}
