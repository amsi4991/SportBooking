
import { apiFetch } from './api';

export async function getBookingsByCourtId(courtId: string) {
  return apiFetch(`/bookings/court/${courtId}`);
}

export async function createBooking(data: any) {
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
