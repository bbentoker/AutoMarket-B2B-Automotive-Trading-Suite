# AutoMarket Landing

Next.js marketing site with dealer login, registration, and auth flows that bridge into the browse and dashboard apps.

## Stack

- Next.js 15
- React 18
- TypeScript
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
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL |
| `NEXT_PUBLIC_BROWSE_APP_URL` | Browse app URL (linked from marketing pages) |
| `NEXT_PUBLIC_DASHBOARD_URL` | Dashboard URL (post-login redirect target) |

See [`.env.example`](.env.example) for placeholder values. These must be set at build time for Docker deployments (see deploy section).

## Run locally

```bash
npm run dev
```

The app runs on port 3000 by default.

## Build

```bash
npm run build
npm start
```

## Deploy

- [`HOW_TO_BUILD_AND_DEPLOY.md`](HOW_TO_BUILD_AND_DEPLOY.md) — full Docker build and deploy guide
- [`Dockerfile`](Dockerfile) — production container image
- [`build.ps1`](build.ps1) — Windows build script
- [`nginx-setup.md`](nginx-setup.md) — reverse proxy setup

## Related docs

- [Authentication flow](AUTH_FLOW.md)
- [Platform feature inventory](../FEATURES.md)
- [Backend API](../automarket-backend/README.md)
