
import { Controller, Get, Query } from '@nestjs/common';
import { PricingService } from './pricing.service';

@Controller('pricing')
export class PricingController {
  constructor(private readonly service: PricingService) {}

  @Get()
  async get(@Query() q: any) {
    return this.service.calculate(
    q.courtId,
      new Date(q.startsAt),
      new Date(q.endsAt),
    );
  }
}
