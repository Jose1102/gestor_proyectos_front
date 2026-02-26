import { getToken } from './auth';
import type { Project } from '../types';

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

export async function listProjects(): Promise<Project[]> {
  const data = await apiRequest<Project[]>('/api/v1/projects');
  return Array.isArray(data) ? data : [];
}

export async function createProject(name: string, description: string): Promise<Project> {
  return apiRequest<Project>('/api/v1/projects', {
    method: 'POST',
    body: JSON.stringify({ name: name || '', description: description || '' }),
  }) as Promise<Project>;
}

export async function getProject(id: string): Promise<Project> {
  return apiRequest<Project>(`/api/v1/projects/${id}`) as Promise<Project>;
}

export async function updateProject(id: string, name: string, description: string): Promise<Project> {
  return apiRequest<Project>(`/api/v1/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name: name || '', description: description || '' }),
  }) as Promise<Project>;
}

export async function deleteProject(id: string): Promise<null> {
  return apiRequest<null>(`/api/v1/projects/${id}`, { method: 'DELETE' }) as Promise<null>;
}

export async function addProjectMember(projectId: string, email: string): Promise<unknown> {
  return apiRequest(`/api/v1/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function removeProjectMember(projectId: string, userId: number | string): Promise<null> {
  return apiRequest<null>(`/api/v1/projects/${projectId}/members/${userId}`, {
    method: 'DELETE',
  }) as Promise<null>;
}
