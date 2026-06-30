# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

ComplAI is an **AI product-compliance dashboard**: a full-stack app covering an end-to-end compliance review platform (product submission → AI analysis → reviewer approval → publishing, with audit trail and analytics).

Two parts:
- **`FrontEnd/ai-product-compliance/`** — React 19 SPA (Vite 8, React Router 7, Tailwind v4, Recharts, Framer Motion). All data access goes through `src/services/*`, which call the backend over HTTP.
- **`BackEnd/`** — Express + SQLite (better-sqlite3) REST API that owns all data and the AI logic. Uses the Claude API (`@anthropic-ai/sdk`) when `ANTHROPIC_API_KEY` is set, with a deterministic local fallback otherwise.

(The `FrontEnd/package.json` at the `FrontEnd/` level is an unused stray; ignore it. `FrontEnd/ai-product-compliance/src/db/` is dead code from the old in-browser-DB design — superseded by the backend, kept only for reference.)

## Running it

Start the backend first, then the frontend (frontend defaults to `http://localhost:4000/api`).

```bash
# Backend (BackEnd/)
npm install
cp .env.example .env     # optional: set ANTHROPIC_API_KEY for real Claude analysis
npm run dev              # node --watch index.js → http://localhost:4000

# Frontend (FrontEnd/ai-product-compliance/) — REQUIRES Node 20+ (Vite 8)
npm install
npm run dev              # http://localhost:5173
npm run build            # production build
npm run lint             # ESLint (flat config)
```

**Node version gotcha — use Node 20+ for BOTH:** Vite 8 requires Node 20.19+/22.12+ (the frontend errors on Node 18 with `CustomEvent is not defined` / rolldown binding errors). The backend's `better-sqlite3` is a native module compiled for a specific Node ABI — run it under the **same** Node version you installed/rebuilt it for, or it fails to load with a `process.dlopen` error. Simplest: `nvm use 22` for everything. If you switch Node versions or hit a dlopen error, run `npm rebuild better-sqlite3` in `BackEnd/` (and delete+reinstall `FrontEnd/.../node_modules` if rolldown complains).

There is **no test runner** configured (`npm test` in `BackEnd/package.json` is a placeholder that exits 1). Verify changes by hitting the API with `curl` and exercising the UI.

## Architecture

Data flow is strictly: **React components/hooks → `src/services/*` → HTTP → Express routes → SQLite**. Don't fetch from components directly; go through a service. Don't query the DB from a route's caller; go through a collection accessor.

### Backend (`BackEnd/`)
- `index.js` — Express wiring: CORS (reflects origin in dev, or `CORS_ORIGIN` allowlist), JSON body, mounts routers under `/api`, `/api/health`. Listens on `PORT` (default 4000).
- `src/db.js` — SQLite document store. Each collection is a table of `(id TEXT PRIMARY KEY, doc JSON)`, queried via SQLite `json_extract` — so collections stay schema-flexible. The `Collection` class mirrors the frontend's old InMemoryDB API: `insert`/`update`/`delete`/`find`/`findById`/`findByIndex`/`paginate`/`groupCount`/`avg`/`sort`. `collection(name, {idPrefix})` is the accessor factory.
- `src/seed.js` — collection accessors (`Products()`, `Rules()`, `Approvals()`, `AuditLogs()`, `Notifications()`, `Users()`, `Reports()`, `Settings()`) + `initDB()`. **Seed data is imported directly from the frontend's `src/data/*.js` modules** (`dummyProducts`, `complianceRules`, `dashboardData`) so the two never drift. Seeding only runs when a collection is empty. **To force a reseed**, bump `SEED_VERSION` (wipes all seeded collections via the `_meta` table).
- `src/ai.js` — the brains. `analyzeProduct(product)` produces+caches a compliance report (real Claude with structured `output_config.format` JSON schema when keyed, else `mockReport`'s deterministic scoring); writes the score back onto the product. `chatbotResponse(question)` is a hybrid: live-catalog intents are always answered in-code against the DB; general regulatory questions go to Claude when keyed, else a scored knowledge base. Claude calls always fall back gracefully on error. Model is `claude-opus-4-8` (override via `ANTHROPIC_MODEL`).
- `src/routes/*.js` — `products`, `ai` (`/reports`, `/analyze`, `/status`), `approvals` (queue, decisions, audit), `users` (`/auth/login` + user CRUD), `chatbot` (`/chat`), `misc` (`/settings`, `/analytics`). Audit-log writes happen inside the product/approval routes.
- `src/utils.js` — `hashPassword` **must stay byte-identical** to the frontend's old scheme (`btoa(unescape(encodeURIComponent(p + '__salt_complianceai')))`) so the seeded demo accounts authenticate.

### Frontend (`FrontEnd/ai-product-compliance/src/`)
- `services/api.js` — `fetch` wrapper; base URL from `VITE_API_URL` (default `http://localhost:4000/api`); throws `Error(server.error)` on non-2xx so callers keep their existing try/catch.
- `services/*.js` — one module per domain (`productService`, `aiService`, `approvalService`, `userService`, `chatbotService`), thin wrappers over `api`. Function signatures and return shapes match what the hooks/components expect. `aiService.simulateAnalysis` stays client-side — it's only the progress-bar animation; the actual analysis is `analyzeProduct` → `POST /analyze/:id`.
- `context/AuthContext.jsx` — `useAuth()`; session persists to **sessionStorage** (survives refresh, clears on tab close); delegates to `userService`.
- `hooks/` (`useProducts`, `useCompliance`) wrap services with loading/error state. `pages/` (one folder per route) compose `components/<feature>/` + shared `components/common/`. Routing/auth gate in `App.jsx`.

### Conventions
- Demo logins: `admin@company.com / admin123`, `sarah.johnson@company.com / sarah123` (all seed users use `<firstname>123`).
- IDs are prefixed + zero-padded (`PRD-001`, `RPT-…`, `APR-…`, `LOG-…`).
- Product status lifecycle: `pending → approved/rejected/revision → published`.
- The app works fully offline (no API key) — analysis and chat fall back to local logic; `/api/health` and `/api/status` report `aiEnabled`.
