import { test, expect } from '@playwright/test';

test.describe('Módulo Registro', () => {

  // CP-REG-01 — Registro exitoso con datos válidos
  test('registro exitoso con datos válidos', async ({ page }) => {
    await page.goto('/auth/register');
    // Email único por corrida (no se puede registrar dos veces el mismo)
    const emailUnico = `test_${Date.now()}@correo.com`;

    await page.locator('[data-test="first-name"]').fill('Juan');
    await page.locator('[data-test="last-name"]').fill('Pérez');
    await page.locator('[data-test="dob"]').fill('1990-05-15');
    await page.locator('[data-test="street"]').fill('Av. Siempreviva 742');
    await page.locator('[data-test="postal_code"]').fill('11000');
    await page.locator('[data-test="city"]').fill('Montevideo');
    await page.locator('[data-test="state"]').fill('Montevideo');
    await page.locator('[data-test="country"]').selectOption('UY');
    await page.locator('[data-test="phone"]').fill('099123456');
    await page.locator('[data-test="email"]').fill(emailUnico);
    await page.locator('[data-test="password"]').fill('Welcome01!');
    await page.locator('[data-test="register-submit"]').click();

   // Verificación: el registro fue exitoso (no quedó en la página con error visible)
    await expect(page.locator('[data-test="register-error"]')).toHaveCount(0);
  });

  // CP-REG-02 — Registro con email de formato inválido
  test('registro con email inválido', async ({ page }) => {
    await page.goto('/auth/register');
    await page.locator('[data-test="first-name"]').fill('Juan');
    await page.locator('[data-test="last-name"]').fill('Pérez');
    await page.locator('[data-test="dob"]').fill('1990-05-15');
    await page.locator('[data-test="email"]').fill('correo-sin-formato');
    await page.locator('[data-test="password"]').fill('Welcome01!');
    await page.locator('[data-test="register-submit"]').click();

    // Verificación: aparece un mensaje de validación
    await expect(page.locator('.invalid-feedback, .alert').first()).toBeVisible();
  });

  // CP-REG-03 — Registro con contraseña débil
  test('registro con contraseña débil', async ({ page }) => {
    await page.goto('/auth/register');
    await page.locator('[data-test="first-name"]').fill('Juan');
    await page.locator('[data-test="last-name"]').fill('Pérez');
    await page.locator('[data-test="dob"]').fill('1990-05-15');
    await page.locator('[data-test="email"]').fill(`debil_${Date.now()}@correo.com`);
    await page.locator('[data-test="password"]').fill('123');
    await page.locator('[data-test="register-submit"]').click();

    // Verificación: aparece un mensaje de validación por contraseña débil
    await expect(page.locator('.invalid-feedback, .alert').first()).toBeVisible();
  });

});