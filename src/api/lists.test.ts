/**
 * Pruebas sencillas del módulo de listas.
 * Comprueban que createList envía siempre title y position (por defecto 0).
 */

jest.mock('./auth', () => ({
  __esModule: true,
  getToken: () => 'token-falso',
}));

import { createList } from './lists';

const mockFetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = mockFetch as typeof fetch;
});

test('createList sin posición envía position 0 en el body', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 201,
    json: async () => ({ id: 1, title: 'Lista', position: 0, cards: [] }),
  });

  await createList('99', 'Mi lista');

  expect(mockFetch).toHaveBeenCalledTimes(1);
  const [, options] = mockFetch.mock.calls[0];
  expect(options?.method).toBe('POST');
  const body = JSON.parse((options?.body as string) ?? '{}');
  expect(body.title).toBe('Mi lista');
  expect(body.position).toBe(0);
});

test('createList con posición envía ese número en el body', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 201,
    json: async () => ({ id: 1, title: 'Otra', position: 2, cards: [] }),
  });

  await createList('99', 'Otra lista', 2);

  const body = JSON.parse((mockFetch.mock.calls[0][1]?.body as string) ?? '{}');
  expect(body.position).toBe(2);
  expect(body.title).toBe('Otra lista');
});
