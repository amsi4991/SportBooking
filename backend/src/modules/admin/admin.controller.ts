
import { Controller, Get, Post, Patch, Delete, UseGuards, Param, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UpdateWalletDto } from './dtos/update-wallet.dto';

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

  @Get('wallet/transactions')
  walletTransactions() {
    return this.service.getWalletTransactions();
  }

  @Get('users/:userId')
  getUserWithWallet(@Param('userId') userId: string) {
    return this.service.getUserWithWallet(userId);
  }

  @Post('users')
  createUser(@Body() body: { email: string; password: string; firstName?: string; lastName?: string }) {
    return this.service.createUser(body.email, body.password, body.firstName, body.lastName);
  }

  @Patch('users/:userId/wallet')
  updateUserWallet(
    @Param('userId') userId: string,
    @Body() body: UpdateWalletDto
  ) {
    return this.service.updateUserWallet(userId, body.amount, body.operation, body.description);
  }

  @Delete('bookings/:bookingId')
  async deleteBooking(@Param('bookingId') bookingId: string) {
    return this.service.deleteBooking(bookingId);
  }
}
