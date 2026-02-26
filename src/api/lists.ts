import { getToken } from './auth';
import type { List } from '../types';

const API_BASE = 'http://localhost:8080';

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T | null> {
  const token = getToken();
  if (!token) {
    throw new Error('No hay sesión. Inicia sesión.');
  }
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  };
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string; error?: string };
    const message = body.message || body.error || `Error ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function listProjectLists(projectId: string): Promise<List[]> {
  const data = await apiRequest<List[]>(`/api/v1/projects/${projectId}/lists`);
  return Array.isArray(data) ? data : [];
}

export async function createList(projectId: string, title: string, position?: number): Promise<List> {
  const body = { title: title || '', position: typeof position === 'number' ? position : 0 };
  return apiRequest<List>(`/api/v1/projects/${projectId}/lists`, {
    method: 'POST',
    body: JSON.stringify(body),
  }) as Promise<List>;
}

export async function updateList(
  projectId: string,
  listId: number,
  title?: string,
  position?: number
): Promise<List> {
  const body: { title?: string; position?: number } = {};
  if (title !== undefined) body.title = title;
  if (typeof position === 'number') body.position = position;
  return apiRequest<List>(`/api/v1/projects/${projectId}/lists/${listId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }) as Promise<List>;
}

export async function deleteList(projectId: string, listId: number): Promise<null> {
  return apiRequest<null>(`/api/v1/projects/${projectId}/lists/${listId}`, {
    method: 'DELETE',
  }) as Promise<null>;
}
