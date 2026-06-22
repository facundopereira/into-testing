import { test, expect } from '@playwright/test';

test.describe('Módulo Filtros y Ordenamiento', () => {

 // CP-FILTRO-01 — Filtrar productos por categoría
  test('filtrar productos por categoría', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-test^="product-"]').first()).toBeVisible();
    // Tilda el primer checkbox de categoría (locator estable por data-test)
    const primeraCategoria = page.locator('[data-test^="category-"]').first();
    await primeraCategoria.scrollIntoViewIfNeeded();
    await primeraCategoria.check();
    // Espera un momento a que la lista se actualice y verifica que haya resultados
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-test^="product-"]').first()).toBeVisible();
  });

  // CP-FILTRO-02 — Ordenar productos por precio (ascendente)
  test('ordenar productos por precio ascendente', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-test^="product-"]').first()).toBeVisible();
    // Ordena por precio de menor a mayor
    await page.locator('[data-test="sort"]').selectOption('price,asc');
    // Verifica que la opción quedó seleccionada y que siguen apareciendo productos
    await expect(page.locator('[data-test="sort"]')).toHaveValue('price,asc');
    await expect(page.locator('[data-test^="product-"]').first()).toBeVisible();
  });

});