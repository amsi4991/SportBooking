
import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly service: WalletService) {}

  @Get()
  get(@Req() req: any) {
    return this.service.getWallet(req.user.id);
  }

  @Get('transactions')
  getTransactions(@Req() req: any) {
    return this.service.getTransactions(req.user.id);
  }

  @Post('add')
  add(@Req() req: any, @Body() body: any) {
    return this.service.addCredit(req.user.id, body.amount);
  }
}
