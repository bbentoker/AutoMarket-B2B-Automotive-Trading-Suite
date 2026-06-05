# AutoMarket Dashboard

Dealer-facing dashboard for wishlists, purchases, invoices, and weekly performance reports.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI

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
| `VITE_API_BASE_URL` | Backend API base URL (e.g. `http://localhost:3000/api`) |
| `VITE_BROWSE_APP_URL` | Public browse app URL for cross-app navigation |
| `VITE_LANDING_URL` | Marketing/landing site URL for auth redirects |

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

## Related docs

- [Weekly report feature](WEEKLY_REPORT_README.md)
- [Platform feature inventory](../FEATURES.md)
- [Backend API](../automarket-backend/README.md)
