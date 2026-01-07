
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWallet(userId: string) {
    return this.prisma.wallet.findUnique({ where: { userId } });
  }

  async addCredit(userId: string, amount: number) {
    return this.prisma.wallet.upsert({
      where: { userId },
      update: { balance: { increment: amount } },
      create: { userId, balance: amount }
    });
  }

  async spend(userId: string, amount: number) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance < amount) {
      throw new BadRequestException('Credito insufficiente');
    }

    return this.prisma.wallet.update({
      where: { userId },
      data: { balance: { decrement: amount } }
    });
  }
}
