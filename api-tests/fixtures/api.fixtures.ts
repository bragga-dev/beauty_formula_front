import { test as base, request, APIRequestContext } from '@playwright/test';

type Fixtures = {
  apiAnon: APIRequestContext;      // sem login, pra testar 401/403
  apiAdmin: APIRequestContext;     // logado como admin
  apiEmployee: APIRequestContext;  // logado como funcionário
};

async function loginContext(email: string, password: string): Promise<APIRequestContext> {
  const anon = await request.newContext({ baseURL: process.env.API_BASE_URL });
  const res = await anon.post('/auth/login', { data: { email, password } });
  if (!res.ok()) {
    throw new Error(`Login falhou pra ${email}: ${res.status()} ${await res.text()}`);
  }
  const { access } = await res.json();
  await anon.dispose();

  return request.newContext({
    baseURL: process.env.API_BASE_URL,
    extraHTTPHeaders: { Authorization: `Bearer ${access}` },
  });
}

export const test = base.extend<Fixtures>({
  apiAnon: async ({}, use) => {
    const ctx = await request.newContext({ baseURL: process.env.API_BASE_URL });
    await use(ctx);
    await ctx.dispose();
  },

  apiAdmin: async ({}, use) => {
    const ctx = await loginContext(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
    await use(ctx);
    await ctx.dispose();
  },

  apiEmployee: async ({}, use) => {
    const ctx = await loginContext(process.env.EMPLOYEE_EMAIL!, process.env.EMPLOYEE_PASSWORD!);
    await use(ctx);
    await ctx.dispose();
  },
});

export { expect } from '@playwright/test';