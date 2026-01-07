
import { apiFetch } from './api';

export async function getBookings() {
  return apiFetch('/admin/bookings');
}

export async function createBooking(data: any) {
  return apiFetch('/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}
