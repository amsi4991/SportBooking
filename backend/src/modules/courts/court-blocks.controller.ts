import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CourtBlocksService } from './court-blocks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('courts/:courtId/blocks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class CourtBlocksController {
  constructor(private readonly service: CourtBlocksService) {}

  @Post()
  async create(
    @Param('courtId') courtId: string,
    @Body() body: { startDate: string; endDate: string; startTime: string; endTime: string; daysOfWeek: number[] }
  ) {
    return this.service.createBlock(
      courtId,
      new Date(body.startDate),
      new Date(body.endDate),
      body.startTime,
      body.endTime,
      body.daysOfWeek
    );
  }

  @Get()
  async getByCourtId(@Param('courtId') courtId: string) {
    return this.service.getBlocksByCourtId(courtId);
  }

  @Delete(':blockId')
  async delete(@Param('blockId') blockId: string) {
    return this.service.deleteBlock(blockId);
  }
}
