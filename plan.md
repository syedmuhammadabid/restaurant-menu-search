# Plan: Add Next.js Frontend for Menu Search

Add a **Next.js (App Router + TypeScript + Tailwind)** frontend under `frontend/` that consumes the existing FastAPI `/search` endpoint, styled with a **dark, minimalistic** theme. The UI includes a search box, category dropdown, min/max price filters, a result-count selector, and relevance-score display. The backend needs **CORS** and a **`/categories`** endpoint.

## Steps

### Phase 1 — Backend enablement (do first, unblocks frontend)
1. Add `CORSMiddleware` to `app/main.py` allowing the frontend origin (configurable, default `*` for dev).
2. Add `GET /categories` in `app/main.py` returning distinct categories, backed by a `list_categories()` helper in `app/search.py` (read from `data/menu.json` via `settings.menu_path`).

### Phase 2 — Frontend scaffold (parallel with Phase 1)
3. Scaffold `frontend/` — Next.js App Router, TypeScript, Tailwind, ESLint. Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local`.
4. Create typed API client `frontend/lib/api.ts` — `searchMenu(params)` and `getCategories()`, plus TS types mirroring the `/search` response (`id, score, name, category, price, tags, size?, items?`).

### Phase 3 — UI components + dark theme (depends on 3, 4)
5. Build the search page (`frontend/app/page.tsx`, client component): `SearchBar` (debounced), `Filters` (category select, min/max price, limit), `ResultsList` + `ResultCard` (name, category, price, tags, optional size/items, relevance score), plus loading/empty/error states and a count header.
6. Apply **dark minimalistic styling**:
   - Dark neutral palette (Tailwind `zinc`/`neutral` 900–950 backgrounds, muted `zinc-400` text), one restrained accent color for focus/score/CTA.
   - Set dark baseline: dark `<body>` in `frontend/app/layout.tsx` + global styles in `frontend/app/globals.css`; no light-mode toggle (dark only).
   - Minimalist layout: centered single column, generous whitespace, thin borders/subtle rings instead of heavy shadows, flat cards, understated hover states, monochrome iconography.

### Phase 4 — Deployment (depends on 1–5)
7. Add `frontend/Dockerfile` (multi-stage `node:20-alpine`, `next build` → `next start`).
8. Extend `docker-compose.yml` with a `web` service (port 3000, `depends_on: api`, `NEXT_PUBLIC_API_URL`).
9. Update `.env.example` (document `NEXT_PUBLIC_API_URL` + any CORS var) and `README.md` (frontend run instructions).

## Relevant files
- `app/main.py` — CORS middleware + `/categories` route.
- `app/search.py` — `list_categories()` helper.
- `app/config.py` — optional `cors_origins` setting (`APP_` prefix).
- `docker-compose.yml` — add `web` service.
- `.env.example` / `README.md` — document vars + usage.
- New: `frontend/app/page.tsx`, `frontend/app/layout.tsx`, `frontend/app/globals.css`, `frontend/lib/api.ts`, component files, `frontend/Dockerfile`.

## Verification
1. Backend: `curl "http://localhost:8000/categories"` returns a JSON list; `/search` still works and includes `Access-Control-Allow-Origin`.
2. Frontend dev: `cd frontend && npm run dev`, open `:3000` — dark UI renders, "spicy chicken" returns scored results, filters work.
3. Visual check: background is dark, single accent, minimal chrome; no light flash on load.
4. Build: `npm run build` succeeds; `docker compose up --build` serves UI at `:3000`.

## Decisions
- Styling: Tailwind, **dark-only minimalistic** theme (zinc/neutral dark palette, single accent, generous whitespace, flat cards).
- Location: `frontend/` monorepo. All requested features included. Docker/compose integration included.
- `/categories` added to avoid hardcoding categories. `.env` never read (per project rules) — only `.env.example` documented.

## Further Considerations
1. CORS scope — allow `*` (dev-simple) or restrict to `http://localhost:3000` via `APP_CORS_ORIGINS`? Recommend: configurable, default `*` in dev.
2. Search trigger — debounced live search (~300ms) vs. submit-only? Recommend: debounced live, Enter also supported.

## Railway Deployment (monorepo)

One Railway **project**, three **services**, all pointing at the same GitHub repo. Each service builds independently.

| Service  | Source              | Root dir    | Builder                | Notes |
| -------- | ------------------- | ----------- | ---------------------- | ----- |
| `qdrant` | image `qdrant/qdrant` | —         | Docker image           | Attach a volume at `/qdrant/storage`; expose 6333 (private) |
| `api`    | this repo           | `/` (root)  | `Dockerfile`           | Existing `railway.toml` applies (healthcheck `/health`) |
| `web`    | this repo           | `/frontend` | `frontend/Dockerfile`  | Next.js standalone; set Root Directory to `frontend/` |

### Steps
1. **Create project + services** — add three services in one Railway project; connect the repo to `api` and `web`.
2. **Root Directory** — set `web` service Root Directory = `frontend/` so it builds only the frontend and uses the correct context. `api` stays at repo root.
3. **Watch paths** (avoid cross-rebuilds):
   - `api`: `app/**`, `data/**`, `scripts/**`, `Dockerfile`, `requirements.txt`
   - `web`: `frontend/**`
4. **Qdrant** — deploy `qdrant/qdrant` image + volume. Point the API at it privately:
   - `api` env: `APP_QDRANT_URL=http://qdrant.railway.internal:6333`
   - (Alternatively use Qdrant Cloud via `APP_QDRANT_URL` + `APP_QDRANT_API_KEY`.)
5. **Ingest once** — run `python -m scripts.run_ingest` against the deployed Qdrant (Railway one-off command / shell, or a temporary release step) so the collection is populated.
6. **Wire the proxy** — set `web` runtime env `API_INTERNAL_URL=http://api.railway.internal:8000`. The browser calls the UI's own `/api` route; no CORS and no build-time API URL needed.

### Same-origin proxy (implemented — default)
The browser calls the UI's own origin (`/api/*`), and a Next.js catch-all Route Handler (`frontend/app/api/[...path]/route.ts`) forwards to `API_INTERNAL_URL` at **runtime**. This avoids CORS entirely and removes the build-time coupling of `NEXT_PUBLIC_*`. `NEXT_PUBLIC_API_URL` defaults to `/api`; `API_INTERNAL_URL` is the server-side target (`http://api.railway.internal:8000` on Railway, `http://api:8000` in Compose, `http://localhost:8000` in local dev).

> A Route Handler is used rather than `next.config` rewrites because rewrite destinations are baked at build time, whereas the handler reads `process.env.API_INTERNAL_URL` per request.

### Direct cross-domain (alternative)
Skip the proxy by setting `NEXT_PUBLIC_API_URL` to the API's **public** domain as a **build variable** on `web` (Railway passes service vars as Docker build args; the Dockerfile accepts `ARG NEXT_PUBLIC_API_URL`). Then set `APP_CORS_ORIGINS=https://<web-public-domain>` on the API. Trade-off: `NEXT_PUBLIC_*` is build-time, so changing the API domain requires rebuilding `web`.

