import { test, expect } from '@playwright/test';

test.describe('Módulo Búsqueda', () => {

  // CP-BUS-01 — Búsqueda de producto existente
  test('búsqueda de producto existente', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-test="search-query"]').fill('hammer');
    await page.locator('[data-test="search-submit"]').click();
    // Verificación: aparece al menos un producto en los resultados
    await expect(page.locator('[data-test^="product-"]').first()).toBeVisible();
  });

  // CP-BUS-02 — Búsqueda sin resultados
  test('búsqueda sin resultados', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-test="search-query"]').fill('xyz123noexiste');
    await page.locator('[data-test="search-submit"]').click();
   // Verificación: aparece el mensaje de que no hay productos
    await expect(page.getByText('There are no products found.')).toBeVisible();
  });

  // CP-BUS-03 — Búsqueda vacía
  test('búsqueda vacía', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-test="search-submit"]').click();
    // Verificación: el sitio sigue mostrando productos (no rompe)
    await expect(page.locator('[data-test^="product-"]').first()).toBeVisible();
  });

});