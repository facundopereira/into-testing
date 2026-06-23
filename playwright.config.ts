import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,        // ← una prueba atrás de otra, no en paralelo
  workers: 1,                  // ← un solo navegador a la vez (clave para el video)
  retries: 1,                  // absorbe inestabilidad de red
  reporter: 'html',
  use: {
    baseURL: 'https://practicesoftwaretesting.com/',
    headless: false,           // ← navegador VISIBLE para grabar
    launchOptions: { slowMo: 700 }, // ← 700ms entre acciones, para que se vea bien lento
    screenshot: 'only-on-failure',
    video: 'off',              // ← apagado: el video lo hace el grabador de pantalla
    trace: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  ],
});