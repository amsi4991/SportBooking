import { Module } from '@nestjs/common';
import { CourtsService } from './courts.service';
import { CourtsController } from './courts.controller';
import { CourtBlocksService } from './court-blocks.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  providers: [CourtsService, CourtBlocksService, PrismaService],
  controllers: [CourtsController],
  exports: [CourtsService, CourtBlocksService]
})
export class CourtsModule {}
