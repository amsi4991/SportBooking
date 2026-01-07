import { Controller, Get, Param, Query } from '@nestjs/common';
import { CourtsService } from './courts.service';

@Controller('courts')
export class CourtsController {
  constructor(private readonly service: CourtsService) {}

  @Get()
  async list(@Query() query: any) {
    return this.service.listCourts({
      city: query.city,
      sport: query.sport,
      priceMin: query.priceMin ? parseInt(query.priceMin) : undefined,
      priceMax: query.priceMax ? parseInt(query.priceMax) : undefined
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.service.getCourtById(id);
  }

  @Get(':id/slots')
  async getSlots(
    @Param('id') id: string,
    @Query('date') date: string
  ) {
    return this.service.getAvailableSlots(id, new Date(date));
  }
}
