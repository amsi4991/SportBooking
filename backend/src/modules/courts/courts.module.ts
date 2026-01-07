import { Module } from '@nestjs/common';
import { CourtsService } from './courts.service';
import { CourtsController } from './courts.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  providers: [CourtsService, PrismaService],
  controllers: [CourtsController],
  exports: [CourtsService]
})
export class CourtsModule {}
