
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async calculate(courtId: string, startsAt: Date, endsAt: Date): Promise<number> {
    // Calcola la durata in ore
    const durationMs = endsAt.getTime() - startsAt.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    // Prova a trovare una regola di prezzo per il giorno specifico
    const weekday = startsAt.getUTCDay();
    const rule = await this.prisma.priceRule.findFirst({
      where: {
        courtId,
        weekday,
        startTime: { lte: startsAt },
        endTime: { gte: endsAt }
      }
    });

    if (rule) {
      return Number(rule.price) * durationHours;
    }

    // Se non trova una regola specifica, cerca qualsiasi regola per il campo
    const anyRule = await this.prisma.priceRule.findFirst({
      where: { courtId }
    });

    if (anyRule) {
      return Number(anyRule.price) * durationHours;
    }

    // Prezzo di default: €50/ora
    return 5000 * durationHours;
  }
}
