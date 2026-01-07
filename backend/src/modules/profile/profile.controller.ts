import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  @Get()
  async get(@Req() req: any) {
    return this.service.getProfile(req.user.sub);
  }

  @Patch()
  async update(@Req() req: any, @Body() body: any) {
    return this.service.updateProfile(req.user.sub, body);
  }

  @Get('bookings')
  async getBookings(@Req() req: any) {
    return this.service.getMyBookings(req.user.sub);
  }
}
