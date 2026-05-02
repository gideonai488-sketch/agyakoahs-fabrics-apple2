# Agyakoahs Fabrics

An e-commerce platform for fabrics built as a React Native / Expo mobile app with a supporting Express API server.

## Architecture

This is a **pnpm monorepo** with the following workspaces:

```
artifacts/
  mobile/        # Expo React Native app (main customer interface)
  api-server/    # Express 5 backend (Paystack proxy, health checks)
  mockup-sandbox/ # Vite-based UI component preview environment
lib/
  api-client-react/  # Auto-generated React hooks (via Orval)
  api-spec/          # OpenAPI/Swagger specification
  api-zod/           # Zod schemas generated from API spec
  db/                # Drizzle ORM schema, migrations, database client
scripts/             # Workspace utility scripts
```

## Tech Stack

- **Frontend:** React Native + Expo SDK 54 (runs as web via react-native-web)
- **Navigation:** expo-router (file-based routing)
- **Backend:** Express 5 + Node.js
- **Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **ORM:** Drizzle ORM (for the local Replit PostgreSQL via `DATABASE_URL`)
- **Payments:** Paystack (handled via Supabase Edge Functions)
- **Data Fetching:** TanStack Query
- **Package Manager:** pnpm workspaces

## Running the App

The **Start application** workflow runs the Expo mobile app in web mode on port 8081:

```bash
cd artifacts/mobile && PORT=8081 pnpm run dev
```

## Key Files

- `artifacts/mobile/lib/supabase.ts` — Supabase client + type definitions
- `artifacts/mobile/lib/db.ts` — Data access functions (products, orders, wishlist)
- `artifacts/mobile/lib/paystack.ts` — Paystack helpers (reference generation, inline HTML)
- `artifacts/mobile/context/AuthContext.tsx` — Supabase Auth context (login, signup, logout)
- `artifacts/mobile/context/CartContext.tsx` — Shopping cart state
- `artifacts/api-server/src/routes/paystack.ts` — Payment initialization/verification endpoints
- `lib/db/src/index.ts` — Drizzle database client (uses `DATABASE_URL`)

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Replit-managed) |

Supabase credentials are embedded in `artifacts/mobile/lib/supabase.ts` (anon key — safe for client use). Paystack payments are processed through Supabase Edge Functions and require no additional secrets here.

## Ports

| Local Port | External Port | Usage |
|---|---|---|
| 8081 | 80 | Expo mobile app (web preview) |
| 8080 | 8080 | API server |
