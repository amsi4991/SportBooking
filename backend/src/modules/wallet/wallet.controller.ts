
import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly service: WalletService) {}

  @Get()
  get(@Req() req: any) {
    return this.service.getWallet(req.user.sub);
  }

  @Post('add')
  add(@Req() req: any, @Body() body: any) {
    return this.service.addCredit(req.user.sub, body.amount);
  }
}
