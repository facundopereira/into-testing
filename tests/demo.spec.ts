import { test, expect, type Page } from '@playwright/test';

/**
 * VIDEO DEMO — un solo test, una sola ventana, TODO de corrido.
 *
 * Junta los 20 casos de los 7 specs reales en UN solo test() que reusa la MISMA
 * `page`: se abre una sola ventana y nunca se cierra ni se reabre entre pruebas.
 *
 * Extras pensados para el video:
 *  - CURSOR VISIBLE: un círculo rojo sigue al mouse y "late" en cada click, así
 *    el que mira el video ve exactamente dónde se está apretando.
 *  - CARTEL POR CASO: antes de cada caso aparece una pantalla (title card) que
 *    dice el código y el nombre del caso (ej: "CASO DE PRUEBA — Login con campos
 *    vacíos") durante ~2 segundos.
 *  - Verificaciones con expect.soft(...): si algo no coincide lo marca pero NO
 *    corta el recorrido, así el video llega siempre hasta el final.
 *  - ORDEN a propósito: checkout como invitado ANTES del login (la pestaña
 *    "Continue as Guest" solo aparece deslogueado) y el login exitoso al final.
 *
 * Cómo correrlo (ventana visible para grabar):
 *    npx playwright test demo.spec.ts --project=chromium
 */

// Sin reintentos en este archivo: si una verificación soft falla, NO queremos que
// Playwright reabra la ventana y vuelva a correr todo en medio de la grabación.
test.describe.configure({ retries: 0 });

// --- Cursor visible: se reinyecta en cada navegación y sigue al mouse ---
async function activarCursorVisible(page: Page) {
  await page.addInitScript(() => {
    const crear = () => {
      if (document.getElementById('pw-cursor')) return;
      const cursor = document.createElement('div');
      cursor.id = 'pw-cursor';
      cursor.style.cssText = [
        'position:fixed', 'top:0', 'left:0', 'width:24px', 'height:24px',
        'background:rgba(255,0,0,0.40)', 'border:2px solid red', 'border-radius:50%',
        'margin-left:-12px', 'margin-top:-12px', 'pointer-events:none',
        'z-index:2147483647', 'transition:width .08s, height .08s, background .08s',
      ].join(';');
      document.body.appendChild(cursor);
      document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
      }, true);
      document.addEventListener('mousedown', () => {
        cursor.style.background = 'rgba(255,210,0,0.85)';
        cursor.style.width = '36px';
        cursor.style.height = '36px';
      }, true);
      document.addEventListener('mouseup', () => {
        cursor.style.background = 'rgba(255,0,0,0.40)';
        cursor.style.width = '24px';
        cursor.style.height = '24px';
      }, true);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', crear);
    } else {
      crear();
    }
  });
}

// --- Cartel a pantalla con el caso de prueba (title card) ---
async function anunciar(page: Page, codigo: string, titulo: string) {
  await page.evaluate(({ codigo, titulo }) => {
    document.getElementById('pw-anuncio')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'pw-anuncio';
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:2147483646',
      'background:rgba(13,17,38,0.94)', 'color:#fff',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:center',
      'font-family:system-ui,Segoe UI,sans-serif', 'text-align:center', 'padding:40px',
    ].join(';');
    overlay.innerHTML =
      '<div style="font-size:20px;letter-spacing:4px;color:#7CC4FF;margin-bottom:18px;">CASO DE PRUEBA</div>' +
      '<div style="font-size:28px;font-weight:700;color:#FFD166;margin-bottom:14px;">' + codigo + '</div>' +
      '<div style="font-size:42px;font-weight:800;max-width:900px;line-height:1.2;">' + titulo + '</div>';
    document.body.appendChild(overlay);
  }, { codigo, titulo });
  await page.waitForTimeout(2000); // el cartel queda visible 2s
  await page.evaluate(() => document.getElementById('pw-anuncio')?.remove());
  await page.waitForTimeout(400);
}

// --- Cartel inicial con cuenta regresiva para arrancar la grabación de pantalla ---
async function cuentaRegresivaInicial(page: Page, segundos = 10) {
  await page.evaluate(() => {
    document.getElementById('pw-countdown')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'pw-countdown';
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:2147483646',
      'background:rgba(13,17,38,0.97)', 'color:#fff',
      'display:flex', 'flex-direction:column', 'align-items:center', 'justify-content:center',
      'font-family:system-ui,Segoe UI,sans-serif', 'text-align:center', 'padding:40px',
    ].join(';');
    overlay.innerHTML =
      '<div style="font-size:44px;font-weight:800;max-width:900px;line-height:1.25;margin-bottom:28px;">' +
        'Preparando el entorno para su grabación' +
      '</div>' +
      '<div style="font-size:20px;letter-spacing:3px;color:#7CC4FF;margin-bottom:18px;">' +
        'INICIE LA GRABACIÓN DE PANTALLA' +
      '</div>' +
      '<div id="pw-countdown-num" style="font-size:120px;font-weight:800;color:#FFD166;line-height:1;"></div>';
    document.body.appendChild(overlay);
  });

  for (let restante = segundos; restante > 0; restante--) {
    await page.evaluate((n) => {
      const num = document.getElementById('pw-countdown-num');
      if (num) num.textContent = String(n);
    }, restante);
    await page.waitForTimeout(1000);
  }

  await page.evaluate(() => document.getElementById('pw-countdown')?.remove());
  await page.waitForTimeout(400);
}

// Deja un mensaje/alerta a la vista unos segundos para que se aprecie en el video.
async function verMensaje(loc: import('@playwright/test').Locator, ms = 2000) {
  try { await loc.scrollIntoViewIfNeeded(); } catch { /* si ya está a la vista, seguimos */ }
  await loc.page().waitForTimeout(ms);
}

// Vacía el carrito por completo: deja la demo en estado limpio entre módulos.
async function vaciarCarrito(page: Page) {
  await page.goto('/checkout');
  let borrar = page.locator('.btn-danger');
  while ((await borrar.count()) > 0) {
    await borrar.first().click();
    await page.waitForTimeout(400);
    borrar = page.locator('.btn-danger');
  }
}

test('DEMO — recorrido completo de los 20 casos', async ({ page }) => {
  test.setTimeout(600_000); // 10 min: con cursor, carteles y slowMo el flujo es largo

  // Activamos el cursor visible ANTES de la primera navegación (se reinyecta solo)
  await activarCursorVisible(page);

  await page.goto('/');
  await page.waitForTimeout(600);

  // 10 segundos con el cartel para que el usuario inicie la grabación de pantalla
  await cuentaRegresivaInicial(page, 10);

  // ===================== 1) BÚSQUEDA =====================
  await test.step('1) Búsqueda de productos', async () => {
    // PE-10 — Búsqueda de producto existente
    await page.goto('/');
    await anunciar(page, 'PE-10', 'Búsqueda de producto existente');
    await page.locator('[data-test="search-query"]').fill('hammer');
    await page.locator('[data-test="search-submit"]').click();
    await expect.soft(page.locator('[data-test^="product-"]').first()).toBeVisible();
    await page.waitForTimeout(800);

    // PE-11 — Búsqueda sin resultados
    await anunciar(page, 'PE-11', 'Búsqueda sin resultados');
    await page.locator('[data-test="search-query"]').fill('xyz123noexiste');
    await page.locator('[data-test="search-submit"]').click();
    const sinResultados = page.getByText('There are no products found.');
    await expect.soft(sinResultados).toBeVisible();
    await verMensaje(sinResultados);

    // PE-09 — Búsqueda vacía (el sitio sigue mostrando productos)
    // Volvemos al inicio para que el catálogo se recargue completo.
    await page.goto('/');
    await anunciar(page, 'PE-09', 'Búsqueda vacía');
    await page.locator('[data-test="search-query"]').fill('');
    await page.locator('[data-test="search-submit"]').click();
    await expect.soft(page.locator('[data-test^="product-"]').first()).toBeVisible();
  });

  // ===================== 2) FILTROS Y ORDENAMIENTO =====================
  await test.step('2) Filtros y ordenamiento', async () => {
    // PE-08 — Filtrar productos por categoría
    await page.goto('/');
    await anunciar(page, 'PE-08', 'Filtrar productos por categoría');
    await expect.soft(page.locator('[data-test^="product-"]').first()).toBeVisible();
    const primeraCategoria = page.locator('[data-test^="category-"]').first();
    await primeraCategoria.scrollIntoViewIfNeeded();
    await primeraCategoria.check();
    await page.waitForTimeout(1000);
    await expect.soft(page.locator('[data-test^="product-"]').first()).toBeVisible();
    await primeraCategoria.uncheck(); // volvemos al estado normal antes de ordenar
    await page.waitForTimeout(600);

    // CP-FILTRO-02 — Ordenar productos por precio (ascendente)
    await anunciar(page, 'CP-FILTRO-02', 'Ordenar productos por precio ascendente');
    await page.locator('[data-test="sort"]').selectOption('price,asc');
    await expect.soft(page.locator('[data-test="sort"]')).toHaveValue('price,asc');
    await expect.soft(page.locator('[data-test^="product-"]').first()).toBeVisible();
  });

  // ===================== 3) VALORES LÍMITE =====================
  await test.step('3) Valores límite', async () => {
    // VL-06 — Cantidad en el carrito = 0 (frontera inferior, inválido)
    await page.goto('/');
    await anunciar(page, 'VL-06', 'Cantidad del carrito en valor límite 0');
    await page.locator('[data-test^="product-"]').first().click();
    await page.locator('[data-test="add-to-cart"]').click();
    await page.locator('[data-test="nav-cart"]').click();
    await page.locator('[data-test="product-quantity"]').fill('0');
    await page.locator('[data-test="product-quantity"]').press('Enter');
    await expect.soft(page.locator('[data-test="product-quantity"]')).not.toHaveValue('0');
    await page.waitForTimeout(800);

    // VL-07 — Contraseña con 7 caracteres (frontera inferior, inválido)
    // Llenamos TODO válido y rompemos SOLO la contraseña, para que la única
    // alerta sea la de la contraseña.
    await page.goto('/auth/register');
    await anunciar(page, 'VL-07', 'Contraseña por debajo del límite (7 caracteres)');
    await page.locator('[data-test="first-name"]').fill('Juan');
    await page.locator('[data-test="last-name"]').fill('Pérez');
    await page.locator('[data-test="dob"]').fill('1990-05-15');
    await page.locator('[data-test="street"]').fill('Av. Siempreviva');
    await page.locator('[data-test="house_number"]').fill('742');
    await page.locator('[data-test="postal_code"]').fill('11000');
    await page.locator('[data-test="city"]').fill('Montevideo');
    await page.locator('[data-test="state"]').fill('Montevideo');
    await page.locator('[data-test="country"]').selectOption('UY');
    await page.locator('[data-test="phone"]').fill('099123456');
    await page.locator('[data-test="email"]').fill(`vl7_${Date.now()}@correo.com`);
    await page.locator('[data-test="password"]').fill('Abc123!'); // 7 caracteres: por debajo del mínimo válido
    await page.locator('[data-test="register-submit"]').click();
    const errorVl7 = page.locator('.alert-danger').first();
    await expect.soft(errorVl7).toBeVisible();
    await verMensaje(errorVl7);

    // VL-03 — Contraseña en el límite válido (8 caracteres, registra OK)
    await page.goto('/auth/register');
    await anunciar(page, 'VL-03', 'Contraseña en el límite exacto (8 caracteres)');
    await page.locator('[data-test="first-name"]').fill('Juan');
    await page.locator('[data-test="last-name"]').fill('Pérez');
    await page.locator('[data-test="dob"]').fill('1990-05-15');
    await page.locator('[data-test="street"]').fill('Av. Siempreviva');
    await page.locator('[data-test="house_number"]').fill('742');
    await page.locator('[data-test="postal_code"]').fill('11000');
    await page.locator('[data-test="city"]').fill('Montevideo');
    await page.locator('[data-test="state"]').fill('Montevideo');
    await page.locator('[data-test="country"]').selectOption('UY');
    await page.locator('[data-test="phone"]').fill('099123456');
    await page.locator('[data-test="email"]').fill(`vl8_${Date.now()}@correo.com`);
    await page.locator('[data-test="password"]').fill('Kp9$mvT2'); // 8 caracteres, cumple todas las reglas
    await page.locator('[data-test="register-submit"]').click();
    // Registro válido → el sitio redirige a la pantalla de login
    await expect.soft(page).toHaveURL(/.*\/auth\/login/, { timeout: 10000 });
    await page.waitForTimeout(1000);
  });

  // ===================== 4) CARRITO =====================
  await test.step('4) Carrito', async () => {
    await vaciarCarrito(page); // arrancamos limpios (VL-01 dejó un producto cargado)

    // TE-02 — Agregar un producto al carrito
    await page.goto('/');
    await anunciar(page, 'TE-02', 'Agregar un producto al carrito');
    await page.locator('[data-test^="product-"]').first().click();
    await page.locator('[data-test="add-to-cart"]').click();
    await expect.soft(page.locator('[data-test="nav-cart"]')).toContainText('1');
    await page.waitForTimeout(800);

    // TP-05 — Modificar la cantidad de un producto (a 3)
    await anunciar(page, 'TP-05', 'Modificar la cantidad de un producto');
    await page.locator('[data-test="nav-cart"]').click();
    await page.locator('[data-test="product-quantity"]').fill('3');
    await page.locator('[data-test="product-quantity"]').press('Enter');
    await expect.soft(page.locator('[data-test="product-quantity"]')).toHaveValue('3');
    await page.waitForTimeout(800);

    // TC-05 — Eliminar un producto del carrito
    await anunciar(page, 'TC-05', 'Eliminar un producto del carrito');
    await page.locator('.btn-danger').first().click();
    await expect.soft(page.getByText(/your cart is empty|cart is empty/i)).toBeVisible();
  });

  // ===================== 5) REGISTRO =====================
  await test.step('5) Registro de usuario', async () => {
    // PE-01 — Registro exitoso con datos válidos (TODOS los campos requeridos)
    await page.goto('/auth/register');
    await anunciar(page, 'PE-01', 'Registro exitoso con datos válidos');
    const emailUnico = `test_${Date.now()}@correo.com`;
    await page.locator('[data-test="first-name"]').fill('Juan');
    await page.locator('[data-test="last-name"]').fill('Pérez');
    await page.locator('[data-test="dob"]').fill('1990-05-15');
    await page.locator('[data-test="street"]').fill('Av. Siempreviva');
    await page.locator('[data-test="house_number"]').fill('742');
    await page.locator('[data-test="postal_code"]').fill('11000');
    await page.locator('[data-test="city"]').fill('Montevideo');
    await page.locator('[data-test="state"]').fill('Montevideo');
    await page.locator('[data-test="country"]').selectOption('UY');
    await page.locator('[data-test="phone"]').fill('099123456');
    await page.locator('[data-test="email"]').fill(emailUnico);
    await page.locator('[data-test="password"]').fill('Kp9$mvT2xQ'); // cumple todas las reglas y no está filtrada
    await page.locator('[data-test="register-submit"]').click();
    // Registro válido → el sitio redirige a la pantalla de login
    await expect.soft(page).toHaveURL(/.*\/auth\/login/, { timeout: 10000 });
    await page.waitForTimeout(1000);

    // PE-02 — Registro con email de formato inválido
    // Llenamos TODO válido y rompemos SOLO el email.
    await page.goto('/auth/register');
    await anunciar(page, 'PE-02', 'Registro con email de formato inválido');
    await page.locator('[data-test="first-name"]').fill('Juan');
    await page.locator('[data-test="last-name"]').fill('Pérez');
    await page.locator('[data-test="dob"]').fill('1990-05-15');
    await page.locator('[data-test="street"]').fill('Av. Siempreviva');
    await page.locator('[data-test="house_number"]').fill('742');
    await page.locator('[data-test="postal_code"]').fill('11000');
    await page.locator('[data-test="city"]').fill('Montevideo');
    await page.locator('[data-test="state"]').fill('Montevideo');
    await page.locator('[data-test="country"]').selectOption('UY');
    await page.locator('[data-test="phone"]').fill('099123456');
    await page.locator('[data-test="email"]').fill('correo-sin-formato'); // ← único dato inválido
    await page.locator('[data-test="password"]').fill('Kp9$mvT2xQ');
    await page.locator('[data-test="register-submit"]').click();
    const errorRegEmail = page.locator('.alert-danger').first();
    await expect.soft(errorRegEmail).toBeVisible();
    await verMensaje(errorRegEmail);

    // PE-03 — Registro con contraseña débil
    // Llenamos TODO válido y rompemos SOLO la contraseña.
    await page.goto('/auth/register');
    await anunciar(page, 'PE-03', 'Registro con contraseña débil');
    await page.locator('[data-test="first-name"]').fill('Juan');
    await page.locator('[data-test="last-name"]').fill('Pérez');
    await page.locator('[data-test="dob"]').fill('1990-05-15');
    await page.locator('[data-test="street"]').fill('Av. Siempreviva');
    await page.locator('[data-test="house_number"]').fill('742');
    await page.locator('[data-test="postal_code"]').fill('11000');
    await page.locator('[data-test="city"]').fill('Montevideo');
    await page.locator('[data-test="state"]').fill('Montevideo');
    await page.locator('[data-test="country"]').selectOption('UY');
    await page.locator('[data-test="phone"]').fill('099123456');
    await page.locator('[data-test="email"]').fill(`debil_${Date.now()}@correo.com`);
    await page.locator('[data-test="password"]').fill('123'); // ← único dato inválido (clave débil)
    await page.locator('[data-test="register-submit"]').click();
    const errorRegPass = page.locator('.alert-danger').first();
    await expect.soft(errorRegPass).toBeVisible();
    await verMensaje(errorRegPass);
  });

  // ===================== 6) CHECKOUT (como invitado, deslogueado) =====================
  await test.step('6) Checkout', async () => {
    // TE-01 — Flujo de compra completo como invitado
    await vaciarCarrito(page);
    await page.goto('/');
    await anunciar(page, 'TE-01', 'Checkout completo como invitado');
    await page.locator('[data-test^="product-"]').first().click();
    await page.locator('[data-test="add-to-cart"]').click();
    await expect.soft(page.locator('[data-test="nav-cart"]')).toContainText('1');

    await page.locator('[data-test="nav-cart"]').click();
    await page.waitForURL('**/checkout');
    await page.locator('[data-test="proceed-1"]').click();

    // El sitio corre en inglés: la pestaña es "Continue as Guest"
    await expect.soft(page.getByRole('tab', { name: 'Continue as Guest' })).toBeVisible();
    await page.getByRole('tab', { name: 'Continue as Guest' }).click();
    await page.locator('[data-test="guest-email"]').fill(`compra_${Date.now()}@correo.com`);
    await page.locator('[data-test="guest-first-name"]').fill('Facundo');
    await page.locator('[data-test="guest-last-name"]').fill('Pereira');
    await page.locator('[data-test="guest-submit"]').click();
    await page.locator('[data-test="proceed-2-guest"]').click();

    await expect.soft(page.locator('[data-test="country"]')).toBeVisible();
    await page.locator('[data-test="country"]').selectOption('UY');
    await page.locator('[data-test="postal_code"]').fill('11000');
    await page.locator('[data-test="house_number"]').fill('742');
    await page.locator('[data-test="street"]').fill('Av. Siempreviva');
    await page.locator('[data-test="state"]').fill('Montevideo');
    await page.locator('[data-test="city"]').fill('Montevideo');
    await page.locator('[data-test="proceed-3"]').click();

    await expect.soft(page.locator('[data-test="payment-method"]')).toBeVisible();
    await page.locator('[data-test="payment-method"]').selectOption('credit-card');
    await page.locator('[data-test="credit_card_number"]').fill('1234-1234-1234-1234');
    await page.locator('[data-test="expiration_date"]').fill('12/2030');
    await page.locator('[data-test="cvv"]').fill('231');
    await page.locator('[data-test="card_holder_name"]').fill('Facundo Pereira');
    await page.locator('[data-test="finish"]').click();
    await expect.soft(page.locator('[data-test="payment-success-message"]')).toBeVisible();
    await page.waitForTimeout(1000);

    // TE-02 — Checkout sin completar datos de invitado (validación)
    await vaciarCarrito(page);
    await page.goto('/');
    await anunciar(page, 'TE-02', 'Checkout con datos de invitado faltantes');
    await page.locator('[data-test^="product-"]').first().click();
    await page.locator('[data-test="add-to-cart"]').click();
    await expect.soft(page.locator('[data-test="nav-cart"]')).toContainText('1');

    await page.locator('[data-test="nav-cart"]').click();
    await page.waitForURL('**/checkout');
    await page.locator('[data-test="proceed-1"]').click();

    await expect.soft(page.getByRole('tab', { name: 'Continue as Guest' })).toBeVisible();
    await page.getByRole('tab', { name: 'Continue as Guest' }).click();
    await page.locator('[data-test="guest-submit"]').click();
    const errorGuest = page.locator('.invalid-feedback, .alert').first();
    await expect.soft(errorGuest).toBeVisible();
    await verMensaje(errorGuest);
  });

  // ===================== 7) LOGIN (las fallidas primero, la exitosa al final) =====================
  await test.step('7) Login', async () => {
    // PE-04 — Login con email inexistente / inválido
    // La alerta "Invalid email or password" aparece ARRIBA del formulario.
    await page.goto('/auth/login');
    await anunciar(page, 'PE-04', 'Login con email inválido');
    await page.locator('[data-test="email"]').fill('noexiste@correo.com');
    await page.locator('[data-test="password"]').fill('welcome01');
    await page.locator('[data-test="login-submit"]').click();
    const errorEmail = page.locator('[data-test="login-error"]');
    await expect.soft(errorEmail).toBeVisible({ timeout: 10000 });
    await verMensaje(errorEmail);

    // PE-03 — Login con contraseña incorrecta
    await page.goto('/auth/login');
    await anunciar(page, 'PE-03', 'Login con contraseña incorrecta');
    await page.locator('[data-test="email"]').fill('customer@practicesoftwaretesting.com');
    await page.locator('[data-test="password"]').fill('claveincorrecta');
    await page.locator('[data-test="login-submit"]').click();
    const errorPass = page.locator('[data-test="login-error"]');
    await expect.soft(errorPass).toBeVisible({ timeout: 10000 });
    await verMensaje(errorPass);

    // PE-14 — Login con campos vacíos (la alerta aparece DEBAJO de los campos)
    await page.goto('/auth/login');
    await anunciar(page, 'PE-14', 'Login con campos vacíos');
    await page.locator('[data-test="login-submit"]').click();
    const errorVacio = page.locator('.invalid-feedback, .alert').first();
    await expect.soft(errorVacio).toBeVisible();
    await verMensaje(errorVacio);

    // PE-17 — Login con credenciales válidas (cierra la demo ya logueado)
    await page.goto('/auth/login');
    await anunciar(page, 'PE-17', 'Login con credenciales válidas');
    await page.locator('[data-test="email"]').fill('customer@practicesoftwaretesting.com');
    await page.locator('[data-test="password"]').fill('welcome01');
    await page.locator('[data-test="login-submit"]').click();
    await expect.soft(page).toHaveURL(/.*account/);
    await page.waitForTimeout(1000);
  });
});
