/**
 * Servicio de autenticación.
 * Base URL de la API REST.
 */
const API_BASE = 'http://localhost:8080';

/**
 * Guarda el token en localStorage (persiste al cerrar el navegador).
 * En una entrevista: se usa para que el usuario no tenga que iniciar sesión en cada recarga.
 */
export function saveAuth(data) {
  localStorage.setItem('authToken', data.token);
  localStorage.setItem('authUser', JSON.stringify({
    userId: data.userId,
    email: data.email,
    role: data.role,
  }));
}

/**
 * Obtiene el token guardado (o null si no hay sesión).
 */
export function getToken() {
  return localStorage.getItem('authToken');
}

/**
 * Cierra sesión: borra token y datos del usuario.
 */
export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
}

/**
 * Login: POST /api/v1/auth/login
 * Body: { email, password }
 * Respuesta 200: { token, type, userId, email, role }
 */
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al iniciar sesión');
  }
  return res.json();
}

/**
 * Registro: POST /api/v1/auth/register
 * Body: { email, password, nombre }
 * Respuesta 201: { token, type, userId, email, role }
 */
export async function register(email, password, nombre) {
  const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nombre }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al registrarse');
  }
  return res.json();
}
