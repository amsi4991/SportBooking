
import { apiFetch } from './api';
import { User } from './users';

export async function getBookingsByCourtId(courtId: string) {
  return apiFetch(`/bookings/court/${courtId}`);
}

export async function createBooking(data: { 
  courtId: string; 
  startsAt: string; 
  endsAt: string; 
  courtType: 'singolo' | 'doppio';
  playerIds: string[];
}) {
  return apiFetch('/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function deleteBooking(bookingId: string) {
  return apiFetch(`/bookings/${bookingId}`, {
    method: 'DELETE'
  });
}


