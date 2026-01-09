import { apiFetch } from './api';

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

export async function getSettings(): Promise<AppSettings> {
  try {
    const result = await apiFetch('/settings');
    return result;
  } catch (error) {
    console.error('❌ Errore API settings:', error);
    throw error;
  }
}

export async function updateBrandSettings(
  icon: string,
  name: string
): Promise<AppSettings> {
  try {
    const result = await apiFetch('/settings/brand', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ icon, name })
    });
    return result;
  } catch (error) {
    console.error('❌ Errore aggiornamento brand:', error);
    throw error;
  }
}

export async function updateDashboardSettings(
  availabilityText: string,
  hoursText: string
): Promise<AppSettings> {
  try {
    const result = await apiFetch('/settings/dashboard', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availabilityText, hoursText })
    });
    return result;
  } catch (error) {
    console.error('❌ Errore aggiornamento dashboard settings:', error);
    throw error;
  }
}
