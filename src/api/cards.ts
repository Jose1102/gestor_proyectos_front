import { getToken } from './auth';
import type { Card, CardInput, MoveCardInput } from '../types';

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

export async function listCards(listId: number): Promise<Card[]> {
  const data = await apiRequest<Card[]>(`/api/v1/lists/${listId}/cards`);
  return Array.isArray(data) ? data : [];
}

export async function createCard(listId: number, data: CardInput): Promise<Card> {
  const body: Record<string, unknown> = {
    title: data.title ?? '',
    position: typeof data.position === 'number' ? data.position : 0,
  };
  if (data.description != null) body.description = data.description;
  if (data.assigneeId != null) body.assigneeId = data.assigneeId;
  if (data.dueDate != null && data.dueDate !== '') body.dueDate = data.dueDate;
  return apiRequest<Card>(`/api/v1/lists/${listId}/cards`, {
    method: 'POST',
    body: JSON.stringify(body),
  }) as Promise<Card>;
}

export async function updateCard(listId: number, cardId: number, data: Partial<CardInput>): Promise<Card> {
  const body: Record<string, unknown> = {};
  if (data.title !== undefined) body.title = data.title;
  if (data.description !== undefined) body.description = data.description;
  if (typeof data.position === 'number') body.position = data.position;
  if (data.assigneeId !== undefined) body.assigneeId = data.assigneeId;
  if (data.dueDate !== undefined) body.dueDate = data.dueDate === '' ? null : data.dueDate;
  return apiRequest<Card>(`/api/v1/lists/${listId}/cards/${cardId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }) as Promise<Card>;
}

export async function moveCard(listId: number, cardId: number, data: MoveCardInput): Promise<Card> {
  const body: { targetListId: number; newPosition?: number } = { targetListId: data.targetListId };
  if (typeof data.newPosition === 'number') body.newPosition = data.newPosition;
  return apiRequest<Card>(`/api/v1/lists/${listId}/cards/${cardId}/move`, {
    method: 'POST',
    body: JSON.stringify(body),
  }) as Promise<Card>;
}

export async function deleteCard(listId: number, cardId: number): Promise<null> {
  return apiRequest<null>(`/api/v1/lists/${listId}/cards/${cardId}`, {
    method: 'DELETE',
  }) as Promise<null>;
}
