import { apiFetch } from './api';

export interface CourtBlock {
  id: string;
  courtId: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
}

export async function getBlocksByCourtId(courtId: string): Promise<CourtBlock[]> {
  try {
    const result = await apiFetch(`/courts/${courtId}/blocks`);
    console.log('✅ API Response blocks:', result);
    return result;
  } catch (error) {
    console.error('❌ Errore API blocks:', error);
    throw error;
  }
}

export async function createBlock(
  courtId: string,
  startTime: string,
  endTime: string,
  daysOfWeek: number[]
): Promise<CourtBlock> {
  return apiFetch(`/courts/${courtId}/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startTime, endTime, daysOfWeek })
  });
}

export async function deleteBlock(courtId: string, blockId: string): Promise<void> {
  return apiFetch(`/courts/${courtId}/blocks/${blockId}`, {
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
