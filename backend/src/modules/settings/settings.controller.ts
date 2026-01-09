import { Controller, Get, Put, Body } from '@nestjs/common';
import { SettingsService, AppSettings } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async getSettings(): Promise<AppSettings> {
    return this.settingsService.getSettings();
  }

  @Put('brand')
  async updateBrandSettings(
    @Body() body: { icon: string; name: string },
  ): Promise<AppSettings> {
    return this.settingsService.updateBrandSettings(body.icon, body.name);
  }

  @Put('dashboard')
  async updateDashboardSettings(
    @Body() body: { availabilityText: string; hoursText: string },
  ): Promise<AppSettings> {
    return this.settingsService.updateDashboardSettings(
      body.availabilityText,
      body.hoursText,
    );
  }
}
