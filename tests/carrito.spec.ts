import { test, expect } from '@playwright/test';

test.describe('Módulo Carrito', () => {

  // CP-CAR-01 — Agregar un producto al carrito
  test('agregar producto al carrito', async ({ page }) => {
    await page.goto('/');
    // Abre el primer producto de la lista (sin depender de un ID fijo)
    await page.locator('[data-test^="product-"]').first().click();
    await page.locator('[data-test="add-to-cart"]').click();
    // Verificación: el contador del carrito muestra 1
    await expect(page.locator('[data-test="nav-cart"]')).toContainText('1');
  });

  // CP-CAR-02 — Modificar la cantidad de un producto
  test('modificar cantidad de producto', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-test^="product-"]').first().click();
    await page.locator('[data-test="add-to-cart"]').click();
    await page.locator('[data-test="nav-cart"]').click();
    // Cambia la cantidad a 3
    await page.locator('[data-test="product-quantity"]').fill('3');
    await page.locator('[data-test="product-quantity"]').press('Enter');
    // Verificación: la cantidad quedó en 3
    await expect(page.locator('[data-test="product-quantity"]')).toHaveValue('3');
  });

  // CP-CAR-03 — Eliminar un producto del carrito
  test('eliminar producto del carrito', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-test^="product-"]').first().click();
    await page.locator('[data-test="add-to-cart"]').click();
    await page.locator('[data-test="nav-cart"]').click();
    // Elimina el producto del carrito
    await page.locator('.btn-danger').first().click();
    // Verificación: aparece el mensaje de carrito vacío
    await expect(page.getByText(/your cart is empty|cart is empty/i)).toBeVisible();
  });

});