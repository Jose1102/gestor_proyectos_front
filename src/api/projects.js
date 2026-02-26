import { getToken } from './auth';

const API_BASE = 'http://localhost:8080';

/**
 * Petición autenticada. Añade Authorization: Bearer <token>.
 * Si la respuesta no es ok (4xx/5xx), lanza Error con el mensaje del servidor o genérico.
 */
async function apiRequest(url, options = {}) {
  const token = getToken();
  if (!token) {
    throw new Error('No hay sesión. Inicia sesión.');
  }
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.message || body.error || `Error ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

/** GET /api/v1/projects - Lista mis proyectos */
export async function listProjects() {
  return apiRequest('/api/v1/projects');
}

/** POST /api/v1/projects - Crear proyecto */
export async function createProject(name, description) {
  return apiRequest('/api/v1/projects', {
    method: 'POST',
    body: JSON.stringify({ name: name || '', description: description || '' }),
  });
}

/** GET /api/v1/projects/{id} - Ver proyecto con listas y tarjetas */
export async function getProject(id) {
  return apiRequest(`/api/v1/projects/${id}`);
}

/** PUT /api/v1/projects/{id} - Actualizar proyecto */
export async function updateProject(id, name, description) {
  return apiRequest(`/api/v1/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name: name || '', description: description || '' }),
  });
}

/** DELETE /api/v1/projects/{id} - Eliminar proyecto */
export async function deleteProject(id) {
  return apiRequest(`/api/v1/projects/${id}`, { method: 'DELETE' });
}

/** POST /api/v1/projects/{id}/members - Añadir miembro (solo propietario) */
export async function addProjectMember(projectId, email) {
  return apiRequest(`/api/v1/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/** DELETE /api/v1/projects/{projectId}/members/{userId} - Eliminar miembro (solo propietario) */
export async function removeProjectMember(projectId, userId) {
  return apiRequest(`/api/v1/projects/${projectId}/members/${userId}`, {
    method: 'DELETE',
  });
}
