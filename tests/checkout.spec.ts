import { test, expect } from '@playwright/test';

test.describe('Módulo Checkout', () => {

  // CP-CHK-01 — Flujo de compra completo como invitado
  test('checkout completo como invitado', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-test^="product-"]').first().click();
    await page.locator('[data-test="add-to-cart"]').click();
    await expect(page.locator('[data-test="nav-cart"]')).toContainText('1');

    await page.locator('[data-test="nav-cart"]').click();
    await page.waitForURL('**/checkout');
    await page.locator('[data-test="proceed-1"]').click();

    // El sitio corre en inglés: la pestaña es "Continue as Guest"
    await expect(page.getByRole('tab', { name: 'Continue as Guest' })).toBeVisible();
    await page.getByRole('tab', { name: 'Continue as Guest' }).click();
    await page.locator('[data-test="guest-email"]').fill(`compra_${Date.now()}@correo.com`);
    await page.locator('[data-test="guest-first-name"]').fill('Facundo');
    await page.locator('[data-test="guest-last-name"]').fill('Pereira');
    await page.locator('[data-test="guest-submit"]').click();
    await page.locator('[data-test="proceed-2-guest"]').click();

    await expect(page.locator('[data-test="country"]')).toBeVisible();
    await page.locator('[data-test="country"]').selectOption('UY');
    await page.locator('[data-test="postal_code"]').fill('11000');
    await page.locator('[data-test="house_number"]').fill('742');
    await page.locator('[data-test="street"]').fill('Av. Siempreviva');
    await page.locator('[data-test="state"]').fill('Montevideo');
    await page.locator('[data-test="city"]').fill('Montevideo');
    await page.locator('[data-test="proceed-3"]').click();

    await expect(page.locator('[data-test="payment-method"]')).toBeVisible();
    await page.locator('[data-test="payment-method"]').selectOption('credit-card');
    await page.locator('[data-test="credit_card_number"]').fill('1234-1234-1234-1234');
    await page.locator('[data-test="expiration_date"]').fill('12/2030');
    await page.locator('[data-test="cvv"]').fill('231');
    await page.locator('[data-test="card_holder_name"]').fill('Facundo Pereira');
    await page.locator('[data-test="finish"]').click();

    await expect(page.locator('[data-test="payment-success-message"]')).toBeVisible();
  });

  // CP-CHK-02 — Checkout sin completar datos de invitado (validación)
  test('checkout con datos de invitado faltantes', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-test^="product-"]').first().click();
    await page.locator('[data-test="add-to-cart"]').click();
    await expect(page.locator('[data-test="nav-cart"]')).toContainText('1');

    await page.locator('[data-test="nav-cart"]').click();
    await page.waitForURL('**/checkout');
    await page.locator('[data-test="proceed-1"]').click();

    await expect(page.getByRole('tab', { name: 'Continue as Guest' })).toBeVisible();
    await page.getByRole('tab', { name: 'Continue as Guest' }).click();
    await page.locator('[data-test="guest-submit"]').click();

    await expect(page.locator('.invalid-feedback, .alert').first()).toBeVisible();
  });

});