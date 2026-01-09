import { Module } from '@nestjs/common';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { CourtsModule } from './modules/courts/courts.module';
import { ProfileModule } from './modules/profile/profile.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    AuthModule,
    AdminModule,
    PricingModule,
    WalletModule,
    BookingsModule,
    CourtsModule,
    ProfileModule,
    SettingsModule
  ],
})
export class AppModule {}