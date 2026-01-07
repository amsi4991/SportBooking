
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly service: BookingsService) {}

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
