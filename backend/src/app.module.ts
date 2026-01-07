import { Module } from '@nestjs/common';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { BookingsModule } from './modules/bookings/bookings.module';

@Module({
  imports: [AuthModule, AdminModule, PricingModule, WalletModule, BookingsModule],
})
export class AppModule {}