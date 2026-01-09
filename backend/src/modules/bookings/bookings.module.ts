import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaService } from '../../database/prisma.service';
import { WalletModule } from '../wallet/wallet.module';
import { PricingModule } from '../pricing/pricing.module';
import { CourtsModule } from '../courts/courts.module';

@Module({
  imports: [WalletModule, PricingModule, CourtsModule],
  providers: [BookingsService, PrismaService],
  controllers: [BookingsController]
})
export class BookingsModule {}
