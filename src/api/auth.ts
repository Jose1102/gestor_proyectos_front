import type { AuthResponse } from '../types';

const API_BASE = 'http://localhost:8080';

export function saveAuth(data: AuthResponse): void {
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('authUser', JSON.stringify({
    userId: data.userId,
    email: data.email,
    role: data.role,
  }));
}

export function getToken(): string | null {
  return localStorage.getItem('authToken');
}

export function logout(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message || 'Error al iniciar sesión');
  }
  return res.json();
}

export async function register(email: string, password: string, nombre: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nombre }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message || 'Error al registrarse');
  }
  return res.json();
}
