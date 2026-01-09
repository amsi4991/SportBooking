import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CourtsService {
  constructor(private prisma: PrismaService) {}

  async listCourts(filters: {
    city?: string;
    sport?: string;
    priceMin?: number;
    priceMax?: number;
  }) {
    return this.prisma.court.findMany({
      where: {
        ...(filters.city && { city: { contains: filters.city, mode: 'insensitive' } }),
        ...(filters.sport && { sport: { contains: filters.sport, mode: 'insensitive' } }),
      },
      include: {
        priceRules: {
          orderBy: [{ startTime: 'asc' }]
        }
      }
    });
  }

  async getCourtById(id: string) {
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

  async getAvailableSlots(courtId: string, date: Date) {
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

  async createCourt(data: {
    name: string;
    city: string;
    sport: string;
    description?: string;
    image?: string;
  }) {
    return this.prisma.court.create({
      data: {
        name: data.name,
        city: data.city,
        sport: data.sport,
        description: data.description,
        image: data.image
      }
    });
  }

  async updateCourt(id: string, data: {
    name?: string;
    city?: string;
    sport?: string;
    description?: string;
    image?: string;
  }) {
    const court = await this.prisma.court.findUnique({ where: { id } });
    if (!court) {
      throw new NotFoundException('Campo non trovato');
    }

    return this.prisma.court.update({
      where: { id },
      data
    });
  }

  async deleteCourt(id: string) {
    const court = await this.prisma.court.findUnique({ where: { id } });
    if (!court) {
      throw new NotFoundException('Campo non trovato');
    }

    // Elimina tutte le prenotazioni associate
    await this.prisma.booking.deleteMany({ where: { courtId: id } });

    // Elimina tutti i blocchi associati
    await this.prisma.courtBlock.deleteMany({ where: { courtId: id } });

    // Elimina tutte le regole di prezzo associate
    await this.prisma.priceRule.deleteMany({ where: { courtId: id } });

    // Elimina il campo
    return this.prisma.court.delete({ where: { id } });
  }

  async createPriceRule(courtId: string, data: {
    weekdays: number[];
    startTime: string;
    endTime: string;
    price: number;
  }) {
    const court = await this.prisma.court.findUnique({ where: { id: courtId } });
    if (!court) {
      throw new NotFoundException('Campo non trovato');
    }

    // Salva direttamente in formato HH:mm
    return this.prisma.priceRule.create({
      data: {
        courtId,
        weekdays: data.weekdays,
        startTime: data.startTime,
        endTime: data.endTime,
        price: data.price
      }
    });
  }

  async getPriceRules(courtId: string) {
    return this.prisma.priceRule.findMany({
      where: { courtId },
      orderBy: [{ startTime: 'asc' }]
    });
  }

  async updatePriceRule(ruleId: string, data: {
    weekdays?: number[];
    startTime?: string;
    endTime?: string;
    price?: number;
  }) {
    const rule = await this.prisma.priceRule.findUnique({ where: { id: ruleId } });
    if (!rule) {
      throw new NotFoundException('Regola di prezzo non trovata');
    }

    return this.prisma.priceRule.update({
      where: { id: ruleId },
      data: {
        ...(data.weekdays && { weekdays: data.weekdays }),
        ...(data.startTime && { startTime: data.startTime }),
        ...(data.endTime && { endTime: data.endTime }),
        ...(data.price !== undefined && { price: data.price })
      }
    });
  }

  async deletePriceRule(ruleId: string) {
    const rule = await this.prisma.priceRule.findUnique({ where: { id: ruleId } });
    if (!rule) {
      throw new NotFoundException('Regola di prezzo non trovata');
    }

    return this.prisma.priceRule.delete({ where: { id: ruleId } });
  }
}
