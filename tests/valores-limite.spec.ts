import { test, expect } from '@playwright/test';

test.describe('Módulo Valores Límite', () => {

  // CP-VL-01 — Cantidad en el carrito = 0 (frontera inferior, inválido)
  test('cantidad del carrito en valor límite 0', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-test^="product-"]').first().click();
    await page.locator('[data-test="add-to-cart"]').click();
    await page.locator('[data-test="nav-cart"]').click();
    // Intenta poner la cantidad en 0 (justo por debajo del mínimo válido de 1)
    await page.locator('[data-test="product-quantity"]').fill('0');
    await page.locator('[data-test="product-quantity"]').press('Enter');
    // Verificación: el sistema NO acepta 0 (el campo no queda en 0)
    await expect(page.locator('[data-test="product-quantity"]')).not.toHaveValue('0');
  });

  // CP-VL-02 — Contraseña con 7 caracteres (frontera inferior, inválido)
  test('contraseña por debajo del límite (7 caracteres)', async ({ page }) => {
    await page.goto('/auth/register');
    await page.locator('[data-test="first-name"]').fill('Juan');
    await page.locator('[data-test="last-name"]').fill('Pérez');
    await page.locator('[data-test="dob"]').fill('1990-05-15');
    await page.locator('[data-test="email"]').fill(`vl7_${Date.now()}@correo.com`);
    await page.locator('[data-test="password"]').fill('Abc123!');  // 7 caracteres
    await page.locator('[data-test="register-submit"]').click();
    // Verificación: aparece un mensaje de validación (contraseña muy corta)
    await expect(page.locator('.invalid-feedback, .alert').first()).toBeVisible();
  });

  // CP-VL-03 — Contraseña con 8 caracteres (límite exacto, válido)
  test('contraseña en el límite exacto (8 caracteres)', async ({ page }) => {
    await page.goto('/auth/register');
    await page.locator('[data-test="first-name"]').fill('Juan');
    await page.locator('[data-test="last-name"]').fill('Pérez');
    await page.locator('[data-test="dob"]').fill('1990-05-15');
    await page.locator('[data-test="street"]').fill('Av. Siempreviva 742');
    await page.locator('[data-test="postal_code"]').fill('11000');
    await page.locator('[data-test="city"]').fill('Montevideo');
    await page.locator('[data-test="state"]').fill('Montevideo');
    await page.locator('[data-test="country"]').selectOption('UY');
    await page.locator('[data-test="phone"]').fill('099123456');
    await page.locator('[data-test="email"]').fill(`vl8_${Date.now()}@correo.com`);
    await page.locator('[data-test="password"]').fill('Abc1234!');  // 8 caracteres
    await page.locator('[data-test="register-submit"]').click();
    // Verificación: el registro NO da error de contraseña (8 es válido)
    await expect(page.locator('[data-test="register-error"]')).toHaveCount(0);
  });

});