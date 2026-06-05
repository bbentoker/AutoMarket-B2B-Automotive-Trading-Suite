# AutoMarket Browse

Public buyer-facing car browsing application with multi-language support (EN, DE, FR, IT, NL).

## Features

- Vehicle search with advanced filters
- Car detail pages with image galleries and damaged-parts views
- Cookie, privacy, and terms policy modals
- Responsive desktop and mobile layouts

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Configure `VITE_API_BASE_URL`, `VITE_LANDING_URL`, and `VITE_DASHBOARD_URL` in `.env`.

## Build

```bash
npm run build
```

See `build.ps1` and `nginx.conf` for Docker deployment configuration.
