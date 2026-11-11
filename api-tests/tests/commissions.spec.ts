import { test, expect } from '../fixtures/api.fixtures';

test.describe('comissões — admin', () => {
  test('lista comissões com filtro de status', async ({ apiAdmin }) => {
    const res = await apiAdmin.get('/commissions/list-all?status=pending&page=1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
  });

  test('soma por status responde 200', async ({ apiAdmin }) => {
    const res = await apiAdmin.get('/commissions/summary');
    expect(res.status()).toBe(200);
  });

  // este é o teste que teria pego o bug do 405 na hora
  test('mark-as-paid-bulk aceita PATCH (não é sequestrado por outra rota)', async ({ apiAdmin }) => {
    const res = await apiAdmin.patch('/commissions/mark-as-paid-bulk', {
      data: { commission_ids: [] },
    });
    expect(res.status()).not.toBe(405);
    expect(res.status()).not.toBe(404);
  });

  test('update-status-period aceita PATCH', async ({ apiAdmin }) => {
    const res = await apiAdmin.patch('/commissions/update-status-period', {
      data: { start_date: '2026-01-01', end_date: '2026-12-31', status: 'paid' },
    });
    expect(res.status()).not.toBe(405);
  });

  test('detalhe por id com uuid inválido retorna 404, não quebra outras rotas', async ({ apiAdmin }) => {
    const res = await apiAdmin.get('/commissions/nao-e-um-uuid');
    expect(res.status()).toBe(404);
  });
});

test.describe('comissões — funcionário não pode escrever', () => {
  test('funcionário tentando marcar como pago recebe 403', async ({ apiEmployee }) => {
    const res = await apiEmployee.patch('/commissions/mark-as-paid-bulk', {
      data: { commission_ids: [] },
    });
    expect(res.status()).toBe(403);
  });
});