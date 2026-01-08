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
export async function getWalletTransactions() {
  return apiFetch('/admin/wallet/transactions');
}

export async function createUser(email: string, password: string, firstName?: string, lastName?: string) {
  return apiFetch('/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email, password, firstName, lastName })
  });
}

export async function getUserWithWallet(userId: string) {
  return apiFetch(`/admin/users/${userId}`);
}

export async function updateUserWallet(userId: string, amount: number, operation: 'add' | 'subtract', description?: string) {
  return apiFetch(`/admin/users/${userId}/wallet`, {
    method: 'PATCH',
    body: JSON.stringify({ amount, operation, description })
  });
}
