# Fórmula da Beleza — Frontend

Frontend de produção para a API de agendamento da Fórmula da Beleza (barbearia & salão), construído com React + TypeScript + Tailwind CSS v4 + Vite.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (tokens de tema em `src/index.css`)
- React Router (rotas em `src/app/router/AppRouter.tsx`)
- TanStack Query (cache e estado de servidor)
- Axios com interceptor de autenticação e refresh automático de token

## Como rodar

```bash
npm install
cp .env.example .env   # ajuste VITE_API_URL se necessário
npm run dev
```

A API backend deve estar rodando em `http://localhost:8000` (ou ajuste `VITE_API_URL` no `.env`).

## Estrutura

```
src/
├── app/            # router, layouts (público e painel), providers (auth, query, toast)
├── components/      # design system reutilizável (ui/, tables/, feedback/)
├── features/        # componentes específicos de domínio (auth, booking, services, team)
├── hooks/           # hooks React Query por domínio
├── services/        # camada de API (um arquivo por recurso do backend)
├── types/           # tipos espelhando os schemas Django Ninja
├── pages/            # páginas públicas + páginas do painel (pages/dashboard)
└── constants/        # rotas e variáveis de ambiente
```

## ⚠️ Limitações conhecidas da API (não inventadas — checar antes de "corrigir")

O backend, no estado em que foi analisado, **não expõe** os seguintes endpoints — o frontend foi construído para lidar com essa ausência de forma organizada, não para escondê-la:

- **Criação/listagem/cancelamento de agendamento** (`Appointment`). Só existe consulta de disponibilidade (`GET /availability/employee/{id}`). A tela `/agendar` (`src/pages/BookingPage.tsx`) implementa os 3 primeiros passos reais (serviço → profissional → horário livre) e mostra um resumo — a etapa de confirmação final fica desabilitada com um aviso, e a chamada já está isolada em `src/services/appointments.service.ts` (`appointmentsService.create`), pronta para ser ligada ao endpoint real assim que ele existir.
- **Pagamentos** — o app `payment` do backend não tem rotas ativas.
- **Listagem administrativa de clientes** e **métricas agregadas de dashboard** — por isso o painel do admin mostra apenas contagens reais (serviços, equipe), sem números inventados.

Quando esses endpoints existirem, basta implementar a função correspondente no arquivo de `services/` já preparado — as telas que os consomem não precisam mudar.

## Contas de teste

Use os endpoints de cadastro (`/cadastro`) para criar um cliente, ou peça para um admin cadastrar um funcionário pelo painel (`Painel → Equipe → Cadastrar funcionário`). Não há seed de dados incluído neste frontend.
# beauty_formula_front
