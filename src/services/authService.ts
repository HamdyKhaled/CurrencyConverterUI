import type { TokenRequest, TokenResponse } from '../types/api';
import { api } from './apiClient';

export async function login(credentials: TokenRequest): Promise<string> {
  const data = await api.post<TokenResponse>('/auth/token', credentials);
  localStorage.setItem('token', data.accessToken);
  return data.accessToken;
}

export function logout(): void {
  localStorage.removeItem('token');
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

export function getTokenPayload(): Record<string, string> | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}
