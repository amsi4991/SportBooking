
import { Controller, Get, Delete, UseGuards, Param } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @Get('stats')
  stats() {
    return this.service.getStats();
  }

  @Get('bookings')
  bookings() {
    return this.service.listBookings();
  }

  @Get('users')
  users() {
    return this.service.listUsers();
  }

  @Delete('bookings/:bookingId')
  async deleteBooking(@Param('bookingId') bookingId: string) {
    return this.service.deleteBooking(bookingId);
  }
}
