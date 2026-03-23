# Dicto

> O fonoaudiólogo e coach de oratória no bolso do universitário.

Simulador de entrevistas de estágio com IA. O Dicto gera perguntas personalizadas por vaga e empresa e entrega feedback específico e acionável — sem cadastro obrigatório.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript strict |
| Estilo | Tailwind CSS 4 + Design System próprio |
| Banco | PostgreSQL via Neon (Prisma 6) |
| Auth | Auth.js v5 (Google OAuth + Email Magic Link) |
| IA | Claude API (claude-sonnet) |
| Pagamentos | Stripe SDK v20 |
| Email | Resend |
| Deploy | Vercel |

## Planos

| | Gratuito | TRIAL | PRO |
|---|---|---|---|
| Simulações | 2/mês | Ilimitadas (14 dias) | Ilimitadas |
| Histórico | — | — | ✓ |
| Preço | R$ 0 | Grátis | R$ 19,90/mês |

## Setup local

```bash
# 1. Clone e instale
git clone https://github.com/danieldemonertr-ops/dicto
cd dicto
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Preencha os valores no .env

# 3. Sincronize o banco
npx prisma db push

# 4. Rode o servidor
npm run dev
```

## Scripts

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run tokens       # Gera CSS variables dos design tokens
npm run tokens:check # Verifica se há hex hardcoded nos componentes
```

## Variáveis de ambiente

Veja `.env.example` para a lista completa com instruções de onde obter cada chave.

## Estrutura

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # Auth.js route handler
│   │   ├── simulation/     # Start, answer, complete
│   │   └── stripe/         # Checkout, portal, webhook
│   ├── simular/            # Tela 1: entrada
│   │   └── [sessionId]/    # Tela 2: simulação
│   │       └── resultado/  # Tela 3: feedback
│   ├── settings/billing/   # Plano e cobrança
│   └── login/              # Auth pages
├── components/
│   └── PaywallGate.tsx
├── design-system/          # Tokens, utils, generate-css
└── lib/
    ├── auth.ts             # Auth.js config
    ├── claude.ts           # Claude API (perguntas + análise)
    ├── limits.ts           # PLAN_LIMITS, checkUsageLimit
    ├── prisma.ts           # Prisma client singleton
    ├── stripe.ts           # Stripe client
    └── subscription.ts     # isTrialActive, hasAccess, etc.
```

## Etapas de build concluídas

- [x] Etapa 0 — Infraestrutura (GitHub + Vercel + Neon + hello world)
- [x] Etapa 1 — Schema do banco (Prisma + Design System)
- [x] Etapa 2 — Autenticação (Auth.js v5)
- [x] Etapa 3 — Trial e assinatura (subscription.ts + webhook Stripe)
- [x] Etapa 4 — Paywall e limites (PLAN_LIMITS + PaywallGate)
- [x] Etapa 5 — Stripe (Checkout + Customer Portal + billing page)
- [x] Etapa 6 — Features do produto (3 telas + Claude API)
- [x] Etapa 7 — Landing page (Hero + Features + Pricing + Footer)
- [x] Etapa 8 — Screenshots nas telas
- [x] Etapa 9 — Configuração final
