
import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly service: WalletService) {}

  @Get()
  get(@Req() req: any) {
    return this.service.getWallet(req.user.id);
  }

  @Post('add')
  add(@Req() req: any, @Body() body: any) {
    return this.service.addCredit(req.user.id, body.amount);
  }
}
