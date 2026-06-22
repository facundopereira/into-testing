import { test, expect } from '@playwright/test';

test.describe('Módulo Login', () => {

  // CP-LOGIN-01 — Login con credenciales válidas
  test('login con credenciales válidas', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('[data-test="email"]').fill('customer@practicesoftwaretesting.com');
    await page.locator('[data-test="password"]').fill('welcome01');
    await page.locator('[data-test="login-submit"]').click();
    // Verificación: al loguearse, redirige al área de cuenta
    await expect(page).toHaveURL(/.*account/);
  });

  // CP-LOGIN-02 — Login con email inexistente / inválido
  test('login con email inválido', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('[data-test="email"]').fill('noexiste@correo.com');
    await page.locator('[data-test="password"]').fill('welcome01');
    await page.locator('[data-test="login-submit"]').click();
    // Verificación: aparece el mensaje de error
    await expect(page.locator('[data-test="login-error"]')).toBeVisible();
  });

  // CP-LOGIN-03 — Login con contraseña incorrecta
  test('login con contraseña incorrecta', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('[data-test="email"]').fill('customer@practicesoftwaretesting.com');
    await page.locator('[data-test="password"]').fill('claveincorrecta');
    await page.locator('[data-test="login-submit"]').click();
    await expect(page.locator('[data-test="login-error"]')).toBeVisible();
  });

  // CP-LOGIN-04 — Login con campos vacíos
  test('login con campos vacíos', async ({ page }) => {
    await page.goto('/auth/login');
    await page.locator('[data-test="login-submit"]').click();
    // Verificación: aparece al menos un mensaje de validación
    await expect(page.locator('.invalid-feedback, .alert').first()).toBeVisible();
  });

});