# AutoMarket Admin

Internal admin panel for dealer management, deal workflows, scraping configuration, and email operations.

## Stack

- React 19
- Vite
- Tailwind CSS
- React Router

## Prerequisites

- Node.js 18 or later
- Running [automarket-backend](../automarket-backend/) API instance

## Setup

```bash
cp .env.example .env
npm install
```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend API base URL (e.g. `http://localhost:3000`) |

See [`.env.example`](.env.example) for placeholder values.

## Run locally

```bash
npm run dev
```

Vite serves the app on port 5173 by default.

## Build

```bash
npm run build
```

Output goes to `dist/`. Preview the production build with:

```bash
npm run preview
```

## Deploy

- [`Dockerfile`](Dockerfile) — production container image
- [`build.ps1`](build.ps1) — Windows build script
- [`nginx.conf`](nginx.conf) — static file serving config
- [`nginx-setup.md`](nginx-setup.md) — reverse proxy setup

## Features

- JWT-protected admin authentication
- Deal and listing management with status filtering and pagination
- Dealer management, scraping configuration, and activity tracking
- Newsletter and email contact management
- Wishlist and offer workflows

## Related docs

- [Platform feature inventory](../FEATURES.md)
- [Backend API](../automarket-backend/README.md)
