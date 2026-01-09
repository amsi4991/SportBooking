import { apiFetch } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  city: string | null;
}

export async function searchUsers(query: string): Promise<User[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  return apiFetch(`/profile/search?q=${encodeURIComponent(query)}`);
}

export function getDisplayName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) {
    return user.firstName;
  }
  if (user.lastName) {
    return user.lastName;
  }
  return user.email;
}
