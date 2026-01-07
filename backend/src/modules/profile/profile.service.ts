import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true
      }
    });
  }

  async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
  }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      include: { wallet: true }
    });
  }

  async getMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        court: {
          select: {
            id: true,
            name: true,
            city: true,
            sport: true
          }
        }
      },
      orderBy: { startsAt: 'desc' }
    });
  }
}
