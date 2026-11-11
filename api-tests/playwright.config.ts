import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Sem isso o .env nunca é lido e todo process.env.* fica undefined —
// era o motivo dos testes não conseguirem nem logar.
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  timeout: 15_000,

  // Testes de API pura, sem browser: rodar em paralelo demais bate no
  // @ratelimit do backend e gera falso-negativo (429 em vez do status
  // que o teste realmente quer verificar).
  fullyParallel: false,
  workers: 1,

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],

  use: {
    baseURL: process.env.API_BASE_URL ?? 'http://localhost:8000/api',
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  },

  // Sem "projects" de chromium/firefox/webkit: nenhum teste aqui usa
  // `page`, então declarar os 3 browsers só faz cada teste rodar 3x à
  // toa (e 3x mais rápido pra estourar o rate limit).
});