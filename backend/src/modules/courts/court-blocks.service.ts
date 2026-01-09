import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CourtBlocksService {
  constructor(private prisma: PrismaService) {}

  async createBlock(courtId: string, startTime: string, endTime: string, daysOfWeek: number[]) {
    // Verifica che il campo esista
    const court = await this.prisma.court.findUnique({
      where: { id: courtId }
    });

    if (!court) {
      throw new NotFoundException('Campo non trovato');
    }

    return this.prisma.courtBlock.create({
      data: {
        courtId,
        startTime,
        endTime,
        daysOfWeek
      }
    });
  }

  async getBlocksByCourtId(courtId: string) {
    return this.prisma.courtBlock.findMany({
      where: { courtId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async deleteBlock(blockId: string) {
    const block = await this.prisma.courtBlock.findUnique({
      where: { id: blockId }
    });

    if (!block) {
      throw new NotFoundException('Blocco non trovato');
    }

    return this.prisma.courtBlock.delete({
      where: { id: blockId }
    });
  }

  async isTimeSlotBlocked(courtId: string, startTime: Date, endTime: Date): Promise<boolean> {
    const blocks = await this.prisma.courtBlock.findMany({
      where: { courtId }
    });

    const dayOfWeek = startTime.getDay();
    const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Converti a 0=lunedì, 6=domenica

    for (const block of blocks) {
      if (!block.daysOfWeek.includes(adjustedDayOfWeek)) {
        continue;
      }

      const blockStartHour = parseInt(block.startTime.split(':')[0]);
      const blockStartMin = parseInt(block.startTime.split(':')[1]);
      const blockEndHour = parseInt(block.endTime.split(':')[0]);
      const blockEndMin = parseInt(block.endTime.split(':')[1]);

      const slotStartHour = startTime.getHours();
      const slotStartMin = startTime.getMinutes();
      const slotEndHour = endTime.getHours();
      const slotEndMin = endTime.getMinutes();

      const blockStart = blockStartHour * 60 + blockStartMin;
      const blockEnd = blockEndHour * 60 + blockEndMin;
      const slotStart = slotStartHour * 60 + slotStartMin;
      const slotEnd = slotEndHour * 60 + slotEndMin;

      // Controlla se c'è sovrapposizione
      if (slotStart < blockEnd && slotEnd > blockStart) {
        return true;
      }
    }

    return false;
  }
}
