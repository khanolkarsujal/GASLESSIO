# GasFree — Full Stack Setup (Integrated)

All systems wired: **Frontend ↔ Platform API ↔ Formance Ledger ↔ Base Sepolia (UGF + contracts)**

## Architecture

```
┌──────────────┐   SIWE + REST    ┌─────────────────┐   HTTP    ┌──────────────────┐
│   React UI   │ ───────────────► │  Platform API   │ ────────► │ Formance Ledger  │
│   (Vite)     │                  │  NestJS :3001   │           │  (double-entry)  │
└──────┬───────┘                  └────────┬────────┘           └──────────────────┘
       │                                   │
       │ UGF SDK                           │ PostgreSQL
       ▼                                   ▼
┌──────────────┐                  ┌─────────────────┐
│  Base Sepolia │                  │  App metadata   │
│  TYI + NFT    │                  │  Prisma         │
└──────────────┘                  └─────────────────┘
```

## Quick start (local)

### 1. Infrastructure

```bash
cd platform
cp .env.example .env
docker compose up -d
```

Wait for Formance on http://localhost:3068

### 2. Platform API

```bash
cd platform/api
npm install
cp ../.env .env
npx prisma migrate deploy
npm run start:dev
```

API: http://localhost:3001/v1/health  
Docs: http://localhost:3001/docs

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173

### 4. User flow

1. **Connect wallet** (Base Sepolia)
2. **Sign in to wallet** (SIWE → platform JWT)
3. **Top up** (dev): use header `X-Topup-Secret: dev_topup_change_me` or the in-app top-up button (`VITE_TOPUP_SECRET` must match `TOPUP_SECRET` in `platform/.env`)
4. **Send / Donate / Checkout** — uses platform ledger when signed in; UGF on-chain TYI otherwise
5. **Claim badge** — UGF gasless mint + auto-record on platform

## Contracts (optional redeploy)

```bash
npm run compile
npm test
npm run deploy:testnet
npm run deploy:wallet:testnet
```

## Legacy backend

`/backend` (Fastify + SQLite) is **deprecated**. Use `/platform` only.

## Environment

| File | Purpose |
|------|---------|
| `platform/.env` | Postgres, Redis, Formance, JWT, TOPUP_SECRET |
| `frontend/.env` | `VITE_PLATFORM_API_URL`, `VITE_TOPUP_SECRET` |
