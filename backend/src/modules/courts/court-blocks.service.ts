import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CourtBlocksService {
  constructor(private prisma: PrismaService) {}

  async createBlock(courtId: string, startDate: Date, endDate: Date, startTime: string, endTime: string, daysOfWeek: number[]) {
    // Verifica che il campo esista
    const court = await this.prisma.court.findUnique({
      where: { id: courtId }
    });

    if (!court) {
      throw new NotFoundException('Campo non trovato');
    }

    // Assicurati che startDate sia a inizio giorno e endDate a fine giorno
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return this.prisma.courtBlock.create({
      data: {
        courtId,
        startDate: start,
        endDate: end,
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

    // Verifica se la data della prenotazione è nel range del blocco
    const bookingDate = new Date(startTime);
    bookingDate.setHours(0, 0, 0, 0);

    const dayOfWeek = startTime.getDay();
    const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Converti a 0=lunedì, 6=domenica

    for (const block of blocks) {
      // Controlla se la data della prenotazione è nel range del blocco
      const blockStart = new Date(block.startDate);
      blockStart.setHours(0, 0, 0, 0);

      const blockEnd = new Date(block.endDate);
      blockEnd.setHours(23, 59, 59, 999);

      if (bookingDate < blockStart || bookingDate > blockEnd) {
        continue; // Data non è nel range del blocco
      }

      // Verifica il giorno della settimana
      if (!block.daysOfWeek.includes(adjustedDayOfWeek)) {
        continue;
      }

      // Verifica l'orario
      const blockStartHour = parseInt(block.startTime.split(':')[0]);
      const blockStartMin = parseInt(block.startTime.split(':')[1]);
      const blockEndHour = parseInt(block.endTime.split(':')[0]);
      const blockEndMin = parseInt(block.endTime.split(':')[1]);

      const slotStartHour = startTime.getHours();
      const slotStartMin = startTime.getMinutes();
      const slotEndHour = endTime.getHours();
      const slotEndMin = endTime.getMinutes();

      const blockStart_min = blockStartHour * 60 + blockStartMin;
      const blockEnd_min = blockEndHour * 60 + blockEndMin;
      const slotStart_min = slotStartHour * 60 + slotStartMin;
      const slotEnd_min = slotEndHour * 60 + slotEndMin;

      // Controlla se c'è sovrapposizione
      if (slotStart_min < blockEnd_min && slotEnd_min > blockStart_min) {
        return true;
      }
    }

    return false;
  }
}
