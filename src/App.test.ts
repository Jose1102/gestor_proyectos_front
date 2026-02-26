/**
 * Pruebas muy sencillas: comprobar que el entorno de tests funciona.
 */

test('el entorno de tests funciona', () => {
  expect(1 + 1).toBe(2);
});

test('comprueba un valor de string', () => {
  const texto = 'Hola';
  expect(texto).toHaveLength(4);
  expect(texto).toMatch(/Hola/);
});

test('comprueba un array', () => {
  const items = [1, 2, 3];
  expect(items).toContain(2);
  expect(items.length).toBe(3);
});
