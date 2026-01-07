
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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
}
