import { apiFetch } from './api';

export async function login(email: string, password: string) {
  const res = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Errore di login');
  }
  
  const data = await res.json();
  if (!data.accessToken) {
    throw new Error('Token non ricevuto dal server');
  }
  localStorage.setItem('token', data.accessToken);
}

