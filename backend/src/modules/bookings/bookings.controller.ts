
import { Controller, Post, Get, Body, UseGuards, Req, Param } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly service: BookingsService) {}

  @Get('court/:courtId')
  async getByCourtId(@Param('courtId') courtId: string) {
    return this.service.getBookingsByCourtId(courtId);
  }

  @Post()
  async create(
    @Req() req: any,
    @Body() body: { courtId: string; startsAt: string; endsAt: string }
  ) {
    return this.service.createBooking(
      req.user.id,
      body.courtId,
      new Date(body.startsAt),
      new Date(body.endsAt)
    );
  }
}
