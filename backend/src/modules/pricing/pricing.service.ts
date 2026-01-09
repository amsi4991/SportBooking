
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
    const weekday = startsAt.getDay();
    const adjustedWeekday = weekday === 0 ? 6 : weekday - 1; // Converti a 0=lunedì, 6=domenica

    // Converti l'orario della prenotazione a HH:mm
    const bookingHour = String(startsAt.getHours()).padStart(2, '0');
    const bookingMin = String(startsAt.getMinutes()).padStart(2, '0');
    const bookingTime = `${bookingHour}:${bookingMin}`;

    const endHour = String(endsAt.getHours()).padStart(2, '0');
    const endMin = String(endsAt.getMinutes()).padStart(2, '0');
    const endTime = `${endHour}:${endMin}`;

    const rule = await this.prisma.priceRule.findFirst({
      where: {
        courtId,
        weekdays: {
          has: adjustedWeekday
        },
        startTime: { lte: bookingTime },
        endTime: { gte: endTime }
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
