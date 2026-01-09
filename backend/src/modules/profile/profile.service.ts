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

  async searchUsers(query: string, currentUserId: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchQuery = query.trim().toLowerCase();

    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          { role: { not: 'admin' } },
          {
            OR: [
              { email: { contains: searchQuery, mode: 'insensitive' } },
              { firstName: { contains: searchQuery, mode: 'insensitive' } },
              { lastName: { contains: searchQuery, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        city: true
      },
      take: 10
    });

    return users;
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
        },
        players: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { startsAt: 'desc' }
    });
  }
}

