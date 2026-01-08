import { apiFetch } from './api';

export async function getAdminStats() {
  return apiFetch('/admin/stats');
}

export async function getAdminBookings() {
  return apiFetch('/admin/bookings');
}

export async function deleteAdminBooking(bookingId: string) {
  return apiFetch(`/admin/bookings/${bookingId}`, {
    method: 'DELETE'
  });
}

export async function getAdminUsers() {
  return apiFetch('/admin/users');
}
