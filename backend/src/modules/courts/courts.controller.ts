import { Controller, Get, Param, Query, Post, Delete, Body, UseGuards, Req } from '@nestjs/common';
import { CourtsService } from './courts.service';
import { CourtBlocksService } from './court-blocks.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('courts')
export class CourtsController {
  constructor(
    private readonly service: CourtsService,
    private readonly blocksService: CourtBlocksService
  ) {}

  @Get()
  async list(@Query() query: any) {
    return this.service.listCourts({
      city: query.city,
      sport: query.sport,
      priceMin: query.priceMin ? parseInt(query.priceMin) : undefined,
      priceMax: query.priceMax ? parseInt(query.priceMax) : undefined
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.service.getCourtById(id);
  }

  @Get(':id/slots')
  async getSlots(
    @Param('id') id: string,
    @Query('date') date: string
  ) {
    return this.service.getAvailableSlots(id, new Date(date));
  }

  @Get(':courtId/blocks')
  async getBlocks(@Param('courtId') courtId: string) {
    return this.blocksService.getBlocksByCourtId(courtId);
  }

  @Post(':courtId/blocks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createBlock(
    @Param('courtId') courtId: string,
    @Body() body: { startTime: string; endTime: string; daysOfWeek: number[] }
  ) {
    return this.blocksService.createBlock(courtId, body.startTime, body.endTime, body.daysOfWeek);
  }

  @Delete(':courtId/blocks/:blockId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteBlock(@Param('blockId') blockId: string) {
    return this.blocksService.deleteBlock(blockId);
  }
}
