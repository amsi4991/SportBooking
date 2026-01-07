import { Injectable } from '@nestjs/common';
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
          take: 1,
          orderBy: { price: 'asc' }
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
}
