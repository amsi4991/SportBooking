import { apiFetch } from './api';

export interface Court {
  id: string;
  name: string;
  city: string;
  sport: string;
  description?: string;
  image?: string;
  priceRules?: PriceRule[];
}

export interface PriceRule {
  id: string;
  courtId: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
  price: number;
}

export async function getAllCourts(): Promise<Court[]> {
  return apiFetch('/courts');
}

export async function createCourt(data: {
  name: string;
  city: string;
  sport: string;
  description?: string;
  image?: string;
}): Promise<Court> {
  return apiFetch('/courts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function updateCourt(
  id: string,
  data: {
    name?: string;
    city?: string;
    sport?: string;
    description?: string;
    image?: string;
  }
): Promise<Court> {
  return apiFetch(`/courts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function deleteCourt(id: string): Promise<void> {
  return apiFetch(`/courts/${id}`, {
    method: 'DELETE'
  });
}

export async function getPriceRules(courtId: string): Promise<PriceRule[]> {
  return apiFetch(`/courts/${courtId}/prices`);
}

export async function createPriceRule(
  courtId: string,
  weekdays: number[],
  startTime: string,
  endTime: string,
  price: number
): Promise<PriceRule> {
  return apiFetch(`/courts/${courtId}/prices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weekdays, startTime, endTime, price })
  });
}

export async function deletePriceRule(courtId: string, ruleId: string): Promise<void> {
  return apiFetch(`/courts/${courtId}/prices/${ruleId}`, {
    method: 'DELETE'
  });
}

export const DAYS_OF_WEEK = [
  { label: 'Lunedì', value: 0 },
  { label: 'Martedì', value: 1 },
  { label: 'Mercoledì', value: 2 },
  { label: 'Giovedì', value: 3 },
  { label: 'Venerdì', value: 4 },
  { label: 'Sabato', value: 5 },
  { label: 'Domenica', value: 6 }
];
