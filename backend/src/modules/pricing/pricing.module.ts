
import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PricingController } from './pricing.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  providers: [PricingService, PrismaService],
  controllers: [PricingController],
  exports: [PricingService]
})
export class PricingModule {}
