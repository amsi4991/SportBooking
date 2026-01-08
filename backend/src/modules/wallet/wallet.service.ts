
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getWallet(userId: string) {
    return this.prisma.wallet.findUnique({ where: { userId } });
  }

  async addCredit(userId: string, amount: number, description?: string) {
    const wallet = await this.prisma.wallet.upsert({
      where: { userId },
      update: { balance: { increment: amount } },
      create: { userId, balance: amount }
    });

    // Registra la transazione
    await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: 'deposit',
        amount,
        description: description || 'Credito aggiunto'
      }
    });

    return wallet;
  }

  async spend(userId: string, amount: number, description?: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance < amount) {
      throw new BadRequestException('Credito insufficiente');
    }

    const updated = await this.prisma.wallet.update({
      where: { userId },
      data: { balance: { decrement: amount } }
    });

    // Registra la transazione
    await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: 'withdrawal',
        amount,
        description: description || 'Pagamento'
      }
    });

    return updated;
  }

  async refund(userId: string, amount: number, description?: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      throw new BadRequestException('Wallet non trovato');
    }

    const updated = await this.prisma.wallet.update({
      where: { userId },
      data: { balance: { increment: amount } }
    });

    // Registra la transazione di rimborso
    await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: 'refund',
        amount,
        description: description || 'Rimborso'
      }
    });

    return updated;
  }

  async getTransactions(userId: string, limit: number = 50) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }
}
