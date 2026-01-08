import { apiFetch } from './api';

export async function getWallet() {
  return apiFetch('/wallet');
}

export async function getTransactions() {
  return apiFetch('/wallet/transactions');
}

export async function addCredit(amount: number) {
  return apiFetch('/wallet/add', {
    method: 'POST',
    body: JSON.stringify({ amount })
  });
}
