import { Controller, Get, Patch, Body, Req, UseGuards, Query } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  @Get()
  async get(@Req() req: any) {
    return this.service.getProfile(req.user.id);
  }

  @Get('search')
  async search(@Query('q') query: string, @Req() req: any) {
    return this.service.searchUsers(query, req.user.id);
  }

  @Patch()
  async update(@Req() req: any, @Body() body: any) {
    return this.service.updateProfile(req.user.id, body);
  }

  @Get('bookings')
  async getBookings(@Req() req: any) {
    return this.service.getMyBookings(req.user.id);
  }
}
