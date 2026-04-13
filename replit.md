# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### Shopping App (mobile) — `/`
Full-featured Temu-style shopping mobile app built with Expo/React Native.

**Features:**
- Splash screen (orange/red gradient with app icon)
- Auth flow: login + signup screens
- Bottom navbar with 5 tabs: Home, Categories, Cart, Orders, Profile
- Home: banner carousel, flash sale timer, category filters, product grid
- Categories: hierarchical browsing with subcategory chips
- Product detail: image gallery, size/color selectors, reviews, add-to-cart
- Cart: quantity controls, order summary, free shipping threshold
- Checkout: 3-step flow (Address → Payment → Review → Order placed)
- Order success: animated confirmation screen
- Search: trending terms, live search with results
- Profile: user info, stats, menu, sign in/out

**State Management:**
- Auth: AsyncStorage-backed context (`context/AuthContext.tsx`)
- Cart: AsyncStorage-backed context (`context/CartContext.tsx`)
- Products: local mock data (`data/products.ts`) with 12 products

**Design:**
- Brand colors: Orange #FF4500 primary
- Font: Inter (400/500/600/700)
- Custom app icon + splash + banner images generated via AI

### API Server — `/api`
Express 5 server (backend). Currently only has health check endpoint.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
