import { test, expect } from '../fixtures/api.fixtures';

test('login com credenciais válidas retorna access token', async ({ apiAnon }) => {
  const res = await apiAnon.post('/auth/login', {
    data: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.access).toBeTruthy();
});

test('login com senha errada retorna 401', async ({ apiAnon }) => {
  const res = await apiAnon.post('/auth/login', {
    data: { email: process.env.ADMIN_EMAIL, password: 'senha-errada-de-proposito' },
  });
  expect(res.status()).toBe(401);
});

test('rota admin sem token retorna 401, não 500 nem 405', async ({ apiAnon }) => {
  const res = await apiAnon.get('/commissions/summary');
  expect(res.status()).toBe(401);
});