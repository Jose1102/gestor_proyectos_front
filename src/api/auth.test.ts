/**
 * Pruebas sencillas del módulo de autenticación.
 */

import { saveAuth, getToken, logout } from './auth';

const localStorageMock = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  };
})();

beforeEach(() => {
  Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });
  localStorageMock.clear();
});

test('saveAuth guarda el token y el usuario en localStorage', () => {
  saveAuth({
    token: 'mi-token-123',
    userId: 1,
    email: 'test@test.com',
    role: 'USER',
  });

  expect(localStorage.getItem('authToken')).toBe('mi-token-123');
  const user = JSON.parse(localStorage.getItem('authUser') ?? '{}');
  expect(user.email).toBe('test@test.com');
  expect(user.userId).toBe(1);
});

test('getToken devuelve el token guardado', () => {
  expect(getToken()).toBe(null);
  localStorageMock.setItem('authToken', 'abc');
  expect(getToken()).toBe('abc');
});

test('logout borra token y usuario', () => {
  localStorageMock.setItem('authToken', 'xyz');
  localStorageMock.setItem('authUser', '{}');
  logout();
  expect(localStorage.getItem('authToken')).toBe(null);
  expect(localStorage.getItem('authUser')).toBe(null);
});
