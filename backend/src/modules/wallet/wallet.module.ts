
import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  providers: [WalletService, PrismaService],
  controllers: [WalletController],
  exports: [WalletService]
})
export class WalletModule {}
