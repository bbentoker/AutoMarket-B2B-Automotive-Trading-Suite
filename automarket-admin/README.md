# AutoMarket Admin

Internal admin panel for the AutoMarket B2B automotive trading platform.

## Features

- JWT-protected admin authentication
- Deal and listing management with status filtering and pagination
- Dealer management, scraping configuration, and activity tracking
- Newsletter and email contact management
- Wishlist and offer workflows

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Set `VITE_API_BASE_URL` in `.env` to your backend API URL (default: `http://localhost:3000`).

## Build

```bash
npm run build
```

See `build.ps1` and `nginx.conf` for Docker deployment configuration.
