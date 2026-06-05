# AutoMarket Backend

REST API for the AutoMarket B2B automotive trading platform — auth, listings, invoices, emails, cron jobs, and scraping integrations.

## Stack

- Node.js 18+
- Express
- Sequelize + PostgreSQL
- S3-compatible object storage (DigitalOcean Spaces / MinIO)
- Mailgun / Resend for transactional email
- Puppeteer, Sharp, node-cron

## Prerequisites

- Node.js 18 or later
- PostgreSQL database (local or managed)
- S3-compatible storage bucket (optional for local dev without image uploads)
- Mailgun or Resend account (optional for local dev without email sending)

## Setup

```bash
cp .env.example .env
npm install
```

Edit `.env` with your database credentials, JWT secret, and any third-party API keys you need.

### Database initialization

Apply the canonical schema from this repo:

```bash
psql -d $DB_NAME -f src/sql/create_tables.sql
psql -d $DB_NAME -f src/sql/create_countries.sql
```

See also [DATABASE.md](../DATABASE.md) at the repo root for the full schema reference.

## Environment variables

Key variables (see [`.env.example`](.env.example) for the complete list):

| Variable | Purpose |
|----------|---------|
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | PostgreSQL connection |
| `JWT_SECRET` | Signs dealer/admin auth tokens |
| `DO_SPACES_KEY`, `DO_SPACES_SECRET`, `DO_BUCKET_NAME` | S3-compatible image/PDF storage |
| `MAILGUN_KEY`, `MAILGUN_DOMAIN` / `RESEND_KEY` | Transactional email |
| `FRONTEND_URL`, `DASHBOARD_URL`, `LANDING_URL` | CORS and email link targets |
| `ENABLE_WISHLIST_SENDING_CRON` | Toggle wishlist notification cron |
| `ZOHO_*` | Optional Zoho CRM integration |

## Run locally

```bash
# Production mode
npm start

# Development with auto-reload
npm run dev

# Preview email templates in browser
npm run email-preview
```

The API listens on port 3000 by default (configurable via `PORT` in `.env`).

## Build

No compile step — Node runs `server.js` directly. For containerized deployment, use the provided Dockerfile.

## Deploy

- [`Dockerfile`](Dockerfile) — production container image
- [`build.ps1`](build.ps1) — Windows build script
- [`docs/nginx-setup.md`](docs/nginx-setup.md) — reverse proxy configuration
- [`configure-minio-bucket.sh`](configure-minio-bucket.sh) / [`.js`](configure-minio-bucket.js) — S3 bucket setup

## Related docs

- [API reference](docs/api.md)
- [Feature inventory](docs/features.md)
- [Canonical DDL](src/sql/create_tables.sql)
- [MinIO migration notes](MINIO_MIGRATION_SUMMARY.md)
- [Zoho removal notes](ZOHO_REMOVAL_SUMMARY.md)
- [Password reset API](password_reset_api.md)
- [Invoice service](docs/INVOICE_SERVICE_README.md)
- [Email preview](docs/EMAIL_PREVIEW_README.md)
- [Wishlist cron](docs/WISHLIST_SENDING_CRON_README.md)
- [Weekly report cron](docs/WEEKLY_REPORT_CRON_README.md)
