import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface AppSettings {
  brandSettings?: {
    icon: string;
    name: string;
  };
  dashboardSettings?: {
    availabilityText: string;
    hoursText: string;
  };
}

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(): Promise<AppSettings> {
    try {
      const settings = await this.prisma.appSettings.findMany();
      const result: AppSettings = {};

      settings.forEach((setting) => {
        if (setting.key === 'brandSettings') {
          result.brandSettings = setting.value as any;
        } else if (setting.key === 'dashboardSettings') {
          result.dashboardSettings = setting.value as any;
        }
      });

      return result;
    } catch (error) {
      console.error('Errore lettura settings:', error);
      return {};
    }
  }

  async updateBrandSettings(
    icon: string,
    name: string,
  ): Promise<AppSettings> {
    try {
      await this.prisma.appSettings.upsert({
        where: { key: 'brandSettings' },
        update: {
          value: { icon, name },
        },
        create: {
          key: 'brandSettings',
          value: { icon, name },
        },
      });

      return this.getSettings();
    } catch (error) {
      console.error('Errore aggiornamento brand settings:', error);
      throw error;
    }
  }

  async updateDashboardSettings(
    availabilityText: string,
    hoursText: string,
  ): Promise<AppSettings> {
    try {
      await this.prisma.appSettings.upsert({
        where: { key: 'dashboardSettings' },
        update: {
          value: { availabilityText, hoursText },
        },
        create: {
          key: 'dashboardSettings',
          value: { availabilityText, hoursText },
        },
      });

      return this.getSettings();
    } catch (error) {
      console.error('Errore aggiornamento dashboard settings:', error);
      throw error;
    }
  }
}
