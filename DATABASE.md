# AutoMarket Database Schema

A complete map of the PostgreSQL database powering the AutoMarket platform.

The database is **shared** between two services:

- **`automarket-backend`** — owns the schema; full CRUD via Sequelize.
- **`automarket-scraper`** — writes directly to `listingsitea_adverts`, `listingsitea_controls`, and `listingsitea_inventory`; reads `users` to learn which dealers to monitor.

**Canonical schema (single source of truth):**

- [`automarket-backend/src/sql/create_tables.sql`](automarket-backend/src/sql/create_tables.sql) — all tables, FKs, indexes
- [`automarket-backend/src/sql/create_countries.sql`](automarket-backend/src/sql/create_countries.sql) — country seed data (run after `create_tables.sql`)
- [`automarket-backend/src/models/associations.js`](automarket-backend/src/models/associations.js) — Sequelize relationship map

> **Foreign keys:** major relationships are enforced in SQL via `FOREIGN KEY` constraints in `create_tables.sql`. A small number of columns (e.g. `wishlist_clicks.listing_id`) remain application-level only. The FK matrix marks any exceptions.

---

## Table of contents

1. [Cluster overview](#1-cluster-overview)
2. [Cluster A — Identity & auth](#2-cluster-a--identity--auth)
3. [Cluster B — Listings & deal pipeline](#3-cluster-b--listings--deal-pipeline)
4. [Cluster C — Engagement (saved, activity, wishlist)](#4-cluster-c--engagement-saved-activity-wishlist)
5. [Cluster D — Communications & email tracking](#5-cluster-d--communications--email-tracking)
6. [Cluster E — Scraper-owned tables](#6-cluster-e--scraper-owned-tables)
7. [Cluster F — Standalone](#7-cluster-f--standalone)
8. [All 27 tables — quick reference](#8-all-27-tables--quick-reference)
9. [Foreign-key matrix](#9-foreign-key-matrix)

---

## 1. Cluster overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          AUTOMARKET DATABASE (PostgreSQL)                       │
│                                                                                 │
│   ┌───────────────────┐         ┌──────────────────────────────┐                │
│   │  A. IDENTITY      │         │   B. LISTINGS & DEAL         │                │
│   │     & AUTH        │         │      PIPELINE                │                │
│   │                   │ users   │                              │                │
│   │ roles             │◄────────┤ listings   statuses          │                │
│   │ user_status       │ seller, │ status_updates               │                │
│   │ users             │ dealer, │ listing_photos               │                │
│   │ login_codes       │ assignee│ damaged_parts                │                │
│   │ reset_password_   │         │ offers     invoices          │                │
│   │   codes           │         └──────────────┬───────────────┘                │
│   └────────┬──────────┘                        │ listing_id                     │
│            │                                   │                                │
│            │ user_id                           ▼                                │
│            ▼                          ┌──────────────────────┐                  │
│   ┌─────────────────────────┐         │  C. ENGAGEMENT       │                  │
│   │ D. COMMUNICATIONS       │         │                      │                  │
│   │    & EMAIL TRACKING     │         │ saved_listings       │                  │
│   │                         │         │ user_activities      │                  │
│   │ countries               │         │ wishlist_options     │                  │
│   │ newsletter_contacts     │         │ wishlist_clicks      │                  │
│   │ newsletters             │         └──────────────────────┘                  │
│   │ user_report_options     │                                                   │
│   │ weekly_report_emails    │         ┌──────────────────────┐                  │
│   │ user_wishlist_sending_  │         │  E. SCRAPER-OWNED    │                  │
│   │   options               │         │                      │                  │
│   │ wishlist_emails         │         │ listingsitea_adverts │ ◄── scraper      │
│   └─────────────────────────┘         │ listingsitea_controls│     writes       │
│                                       │ listingsitea_inventory│                 │
│                                       └──────────────────────┘                  │
│                                                                                 │
│   ┌──────────────────────────────────────────┐                                  │
│   │  F. STANDALONE                           │                                  │
│   │  zoho_tokens, blogs                      │                                  │
│   └──────────────────────────────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

| Cluster | Tables | Purpose |
|---------|--------|---------|
| A. Identity & auth | 5 | Users, roles, auth tokens |
| B. Listings & deal pipeline | 7 | Cars and the 14-stage workflow |
| C. Engagement | 4 | Saved, activity, wishlist |
| D. Communications & email tracking | 8 | Newsletter + weekly report + wishlist emails |
| E. Scraper-owned | 3 | Scraped dealer inventory |
| F. Standalone | 2 | Blogs, Zoho tokens |
| **Total** | **28** | |

---

## 2. Cluster A — Identity & auth

`users` is the most-joined-to table in the database. Dealers and admins are both `users`, distinguished by `role_id` (1 = admin, 2 = dealer) and `status_id` (2 = active).

```
                  ┌──────────────────┐         ┌──────────────────┐
                  │      roles       │         │   user_status    │
                  │  id (PK)         │         │  id (PK)         │
                  │  name            │         │  name            │
                  └────────▲─────────┘         └────────▲─────────┘
                           │                            │
                  role_id  │                  status_id │
                           │                            │
                  ┌────────┴────────────────────────────┴──────────┐
                  │                  users                         │
                  │  id (PK)                                       │
                  │  email (unique)        name                    │
                  │  company_name          phone_number            │
                  │  vat_number            password (bcrypt)       │
                  │  role_id               status_id               │
                  │  language              country                 │
                  │  billing_street/city/state/country/code        │
                  │  listingsitea_url      zoho_id (unique)        │
                  └────┬──────────────────────────┬────────────────┘
                       │                          │
              user_id  │                          │  user_id
                       ▼                          ▼
        ┌────────────────────────┐     ┌────────────────────────────┐
        │      login_codes       │     │   reset_password_codes     │
        │  id (PK)               │     │  id (PK)                   │
        │  user_id               │     │  user_id                   │
        │  token (unique)        │     │  code (unique)             │
        │                        │     │  is_used                   │
        │  used by magic-link    │     │  used by /forgot-password  │
        │  emails (wishlist,     │     │  + /reset-password         │
        │  weekly report)        │     │                            │
        └────────────────────────┘     └────────────────────────────┘
```

---

## 3. Cluster B — Listings & deal pipeline

The core of the platform. A `listings` row carries the car spec + every field needed to drive the 14-stage workflow (seller info, buyer info, transport, payment dates, tracking codes). The status of each listing is one of 14 rows in `statuses`, and every change is logged into `status_updates`.

```
                 ┌──────────────────┐
                 │     statuses     │      14 rows: 1..14
                 │  id (PK), name   │      1=Cars for Sale ... 13=Deal Done, 14=No Deal
                 └────────▲─────────┘
                          │
              status_id   │       previous_status_id / current_status_id
                          │       ┌─────────────────────────────────────────┐
                          │       │            status_updates                │
                          │       │  id (PK)                                 │
                          │       │  listing_id   ────► listings.id          │
                          │       │  previous_status_id ──► statuses.id      │
                          │       │  current_status_id  ──► statuses.id      │
                          │       │  created_at                              │
                          │       └─────────────────────────────────────────┘
                          │                       ▲
                          │                       │ listing_id
       users.id ─seller_id│                       │
       users.id ─assigned_to_id                   │
                          │                       │
                  ┌───────┴───────────────────────┴───────────────────────────┐
                  │                       listings                            │
                  │  id (PK)                                                  │
                  │  seller_id (→ users)         assigned_to_id (→ users)     │
                  │  status_id (→ statuses)                                   │
                  │  brand_name   model     vin_number    registration_number │
                  │  km_stand     horsepower  fuel_type  transmission_type    │
                  │  color   seat   co2   features   vat_or_margin            │
                  │  listing_price   belgium_price   currency                 │
                  │  deal_stage   expiration   is_viewed   is_deleted         │
                  │  is_listingsitea / b / c                                  │
                  │  reference_no   internal_url   listingsitea_link          │
                  │  -- workflow / billing fields ----------                  │
                  │  proforma_invoice_number   invoice_id   proforma_inv_date │
                  │  expected_pick_up_date     expected_delivery_date         │
                  │  expected_close_date       closing_date                   │
                  │  pick_up_address  document_sent_address  car_delivery_addr│
                  │  tracking_code   transport_cost                           │
                  │  amount_purchased  amount_sold_for  submitted_offer_amount│
                  │  buyer_company_name  buyer_s_email  payment_send_date     │
                  │  seller_email seller_company contact_person tel mobile    │
                  │  language   zoho_id   created_at   updated_at             │
                  └─┬───────────┬───────────────┬────────────┬────────────────┘
                    │ listing_id│               │            │
                    │           │               │            │
                    ▼           ▼               ▼            ▼
        ┌────────────────┐  ┌─────────────┐  ┌─────────┐  ┌────────────────┐
        │ listing_photos │  │damaged_parts│  │ offers  │  │   invoices     │
        │  id (PK)       │  │  id (PK)    │  │ id (PK) │  │  id (PK)       │
        │  listing_id    │  │  listing_id │  │ listing_│  │  listing_id    │
        │  url           │  │  part_id    │  │   id    │  │  dealer_id     │
        │                │  │  photo      │  │ dealer_ │  │   (→ users)    │
        │  (FK enforced) │  │  description│  │   id    │  │  amount, EUR   │
        └────────────────┘  └─────────────┘  │  (→users)│ │  is_paid       │
                                             │ offer    │ │  paid_at       │
                                             │ counter_ │ │  invoice_number│
                                             │  offer   │ │  description   │
                                             │ is_approved│  due_date      │
                                             │ is_rejected│  link (PDF)    │
                                             │ is_read   │ │                │
                                             └──────────┘ └────────────────┘
```

---

## 4. Cluster C — Engagement (saved, activity, wishlist)

How a dealer interacts with both real listings and scraped adverts.

```
                ┌──────────────────────────────────┐
                │              users               │
                │              listings            │
                └──────┬──────────────────┬────────┘
                       │                  │
        user_id +      │                  │  user_id +
        listing_id     │                  │  listing_id
                       ▼                  ▼
        ┌──────────────────────┐  ┌─────────────────────────┐
        │   saved_listings     │  │     user_activities     │
        │  id (PK)             │  │  id (PK)                │
        │  user_id             │  │  user_id   listing_id   │
        │  listing_id          │  │  activity_date          │
        │                      │  │  type   contacted       │
        │  ("Saved Cars" page) │  │                         │
        │                      │  │  type ∈ {web click,     │
        │                      │  │  mail open, newsletter, │
        │                      │  │  wishlist opened}       │
        └──────────────────────┘  └─────────────────────────┘


        ┌──────────────────────────────────────────────────────────┐
        │                  wishlist_options                        │
        │  id (PK)                                                 │
        │  user_id           (→ users.id)                          │
        │  listing_id  *     (→ listingsitea_adverts.id in practice)│
        │  listing_vat_type                                        │
        │  offered_price   offered_price_vat_type   currency       │
        │                                                          │
        │  Created by admin in /wishlist-options to build a        │
        │  curated buy-list for a dealer.                          │
        └──────────────┬───────────────────────────────────────────┘
                       │  wishlist_option_id
                       ▼
        ┌──────────────────────────────────────────────────────────┐
        │                  wishlist_clicks                         │
        │  id (PK)                                                 │
        │  wishlist_option_id    listing_id   user_id              │
        │                                                          │
        │  Recorded when a dealer clicks "I'm Interested" on the   │
        │  /wishlist page in the dashboard.                        │
        └──────────────────────────────────────────────────────────┘

   listing_id has an SQL FK to listingsitea_adverts.id (historical column name).
```

---

## 5. Cluster D — Communications & email tracking

Every outbound email is logged with its Mailgun message id so the inbound webhook (`POST /api/mailgun`) can record opens and clicks. Three independent email pipelines live here.

```
─── Newsletter ──────────────────────────────────────────────────────────────

   ┌────────────────┐        ┌─────────────────────────┐
   │   countries    │◄───────┤  newsletter_contacts    │
   │  id (PK)       │        │  id (PK)                │
   │  name, code    │        │  name, company          │
   └────────────────┘        │  email (unique)         │
                             │  country_id             │
                             └───────────┬─────────────┘
                                         │ newsletter_contact_id
                                         ▼
                             ┌──────────────────────────────┐
                             │        newsletters           │
                             │  id (PK)                     │
                             │  newsletter_contact_id       │
                             │  listing_id  (→ listings)    │
                             │  recipient_email             │
                             │  email_type ('newsletter')   │
                             │  mailgun_message_id          │
                             │  is_opened   opened_at       │
                             │  sent_at                     │
                             └──────────────────────────────┘


─── Weekly dealer report ────────────────────────────────────────────────────

   ┌─────────────────────────────┐         ┌────────────────────────────────┐
   │   user_report_options       │         │     weekly_report_emails       │
   │  id (PK)                    │         │  id (PK)                       │
   │  user_id (unique → users)   │         │  user_id   recipient_email     │
   │  when_to_send  (JSONB)      │  ───►   │  mailgun_message_id (unique)   │
   │  is_sending   percentage    │  cron   │  week_start_date  week_end_date│
   │  suggestions  (JSONB)       │         │  week_number   year   language │
   │                             │         │  is_opened   opened_at         │
   │  Per-dealer schedule for    │         │                                │
   │  the weekly report email.   │         │  Indexes:                      │
   │                             │         │   - user_id                    │
   │  Cron: hourly cron compares │         │   - (week_start, week_end)     │
   │  when_to_send to current    │         │   - (year, week_number)        │
   │  day+hour.                  │         └────────────────────────────────┘
   └─────────────────────────────┘


─── Wishlist email ──────────────────────────────────────────────────────────

   ┌────────────────────────────────────┐   ┌────────────────────────────┐
   │  user_wishlist_sending_options     │   │     wishlist_emails        │
   │  id (PK)                           │   │  id (PK)                   │
   │  user_id (unique → users)          │   │  user_id (→ users)         │
   │  when_to_send  (JSONB)             │──►│  mailgun_message_id (uniq) │
   │  is_sending                        │cron│  is_opened   when_opened   │
   │                                    │   │  sent_at                   │
   │  Per-dealer schedule for the       │   │                            │
   │  wishlist digest email.            │   │  Indexes: user_id, sent_at,│
   │                                    │   │  is_opened, msg_id         │
   └────────────────────────────────────┘   └────────────────────────────┘
```

---

## 6. Cluster E — Scraper-owned tables

These three tables are written by the **scraper service**, not by the backend API. They power the admin's "Scraped Dealers" / "Scraping Analysis" pages and feed the wishlist matching pipeline.

```
   ┌────────────────────────────────────────────────────────────────────────┐
   │                        listingsitea_adverts                            │
   │  id (PK)                                                               │
   │  listingsitea_id     (scraped source id, unique per source)            │
   │  seller_id           (→ users.id  — the dealer being monitored)        │
   │  seller_name         make            model         model_version       │
   │  first_registration  mileage         price        price_currency       │
   │  body_type   type    drivetrain      seats         doors               │
   │  power       gearbox  engine_size    gears         cylinders           │
   │  fuel_type   fuel_consumption        co_2_emissions  emission_class    │
   │  color  paint  upholstery  upholstery_color                            │
   │  comfort  entertainment  safety  extras  description                   │
   │  location  link  image_url  original_image_url                         │
   │  empty_weight  previous_owner  full_service_history  non_smoker_vehicle│
   │  is_active            (still live on source site)                      │
   │  last_seen            (set by checker when it disappears)              │
   │  sell_time            (days from created_at to last_seen)              │
   │  is_initial_run_listing  (true for first-import seed; excluded by      │
   │                           default scope)                               │
   │  created_at                                                            │
   │                                                                        │
   │  Indexes: listingsitea_id, seller_id, is_active, created_at,           │
   │           last_seen, make, model, price, first_registration, location, │
   │           (seller_id,is_active), (make,model,is_active),               │
   │           (price,is_active,seller_id), (created_at DESC,is_active)     │
   └────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────────┐  ┌────────────────────────────────┐
   │    listingsitea_controls         │  │   listingsitea_inventory       │
   │  id (PK)                         │  │  id (PK)                       │
   │  date                            │  │  seller_id   (→ users.id)      │
   │                                  │  │  count                         │
   │  One row per scrape session;     │  │                                │
   │  used to compute week-over-week  │  │  Weekly snapshot of advert     │
   │  deltas.                         │  │  count per dealer.             │
   └──────────────────────────────────┘  └────────────────────────────────┘
```

---

## 7. Cluster F — Standalone

```
   ┌─────────────────────────────┐    ┌─────────────────────────────────────┐
   │        zoho_tokens          │    │              blogs                  │
   │  id (PK)                    │    │  id (PK)                            │
   │  access_token   (text)      │    │  title                              │
   │  refresh_token  (text)      │    │  slug   (unique)                    │
   │  expires_in     (int)       │    │  excerpt   content                  │
   │  created_at                 │    │  category   read_time   date        │
   │                             │    │  image  (TEXT — base64 or URL)      │
   │  Cached OAuth tokens for    │    │  featured   is_published            │
   │  optional Zoho CRM sync.    │    │  author_id   (→ users.id)           │
   │  Refreshed on demand.       │    │  created_at   updated_at            │
   └─────────────────────────────┘    │                                     │
                                      │  Trigger update_blogs_updated_at    │
                                      │  auto-bumps updated_at on UPDATE.   │
                                      └─────────────────────────────────────┘
```

---

## 8. All 28 tables — quick reference

| # | Table | Cluster | Primary keys / unique | Key columns |
|---|-------|---------|----------------------|-------------|
| 1 | `roles` | A | `id` PK | `name` |
| 2 | `user_status` | A | `id` PK | `name` |
| 3 | `users` | A | `id` PK; `email` unique; `zoho_id` unique | `role_id`, `status_id`, `company_name`, `vat_number`, `language`, `country`, `listingsitea_url` |
| 4 | `login_codes` | A | `id` PK; `token` unique | `user_id` |
| 5 | `reset_password_codes` | A | `id` PK; `code` unique | `user_id`, `is_used` |
| 6 | `statuses` | B | `id` PK | `name` (14 fixed rows) |
| 7 | `listings` | B | `id` PK | `seller_id`, `status_id`, `assigned_to_id`, `brand_name`, `model`, `vin_number`, `km_stand`, `listing_price`, `vat_or_margin`, `deal_stage`, `is_deleted`, `expiration`, `reference_no` |
| 8 | `status_updates` | B | `id` PK; FKs to `listings`, `statuses` | `listing_id`, `previous_status_id`, `current_status_id` |
| 9 | `listing_photos` | B | `id` PK; FK to `listings` | `listing_id`, `url` |
| 10 | `damaged_parts` | B | `id` PK | `listing_id`, `part_id`, `photo`, `description` |
| 11 | `offers` | B | `id` PK | `dealer_id`, `listing_id`, `offer`, `counter_offer`, `is_approved`, `is_rejected`, `is_read` |
| 12 | `invoices` | B | `id` PK; `invoice_number` unique | `dealer_id`, `listing_id`, `amount`, `currency`, `is_paid`, `due_date`, `link` |
| 13 | `saved_listings` | C | `id` PK; UNIQUE(`user_id`, `listing_id`) | `user_id`, `listing_id` |
| 14 | `user_activities` | C | `id` PK | `user_id`, `listing_id`, `activity_date`, `type`, `contacted` |
| 15 | `wishlist_options` | C | `id` PK; UNIQUE(`user_id`, `listing_id`); FK `listing_id` → `listingsitea_adverts` | `user_id`, `listing_id`, `offered_price`, `offered_price_vat_type`, `currency` |
| 16 | `wishlist_clicks` | C | `id` PK | `wishlist_option_id`, `listing_id`, `user_id` |
| 17 | `countries` | D | `id` PK | `name`, `code` |
| 18 | `newsletter_contacts` | D | `id` PK; `email` unique | `name`, `company`, `country_id` |
| 19 | `newsletters` | D | `id` PK; FKs to `listings`, `newsletter_contacts` | `newsletter_contact_id`, `listing_id`, `email_type`, `recipient_email`, `mailgun_message_id`, `is_opened`, `opened_at`, `sent_at` |
| 20 | `user_report_options` | D | `id` PK; `user_id` unique | `when_to_send` JSONB, `is_sending`, `percentage`, `suggestions` JSONB |
| 21 | `weekly_report_emails` | D | `id` PK; `mailgun_message_id` unique; FK to `users` | `user_id`, `week_start_date`, `week_end_date`, `week_number`, `year`, `language`, `is_opened`, `opened_at` |
| 22 | `user_wishlist_sending_options` | D | `id` PK; `user_id` unique; FK to `users` | `when_to_send` JSONB, `is_sending` |
| 23 | `wishlist_emails` | D | `id` PK; `mailgun_message_id` unique | `user_id`, `is_opened`, `when_opened`, `sent_at` |
| 24 | `listingsitea_adverts` | E | `id` PK; `listingsitea_id` UNIQUE | `listingsitea_id`, `seller_id`, `make`, `model`, `price`, `mileage`, `is_active`, `last_seen`, `sell_time`, `is_initial_run_listing`, `original_image_url` |
| 25 | `listingsitea_controls` | E | `id` PK | `date` |
| 26 | `listingsitea_inventory` | E | `id` PK; FK to `users` | `seller_id`, `count` |
| 27 | `zoho_tokens` | F | `id` PK | `access_token`, `refresh_token`, `expires_in` |
| 28 | `blogs` | F | `id` PK; `slug` unique | `title`, `category`, `featured`, `is_published`, `author_id`, `content` |

> `wishlist_options.listing_id` is a historical column name; the SQL FK points at `listingsitea_adverts.id` (scraped inventory), not `listings.id`.

---

## 9. Foreign-key matrix

Legend: `SQL` = `FOREIGN KEY` in [`create_tables.sql`](automarket-backend/src/sql/create_tables.sql); `ORM` = Sequelize-only (no DB constraint).

| Child table | Column | → Parent table.column | Enforcement |
|-------------|--------|----------------------|-------------|
| `users` | `role_id` | `roles.id` | SQL |
| `users` | `status_id` | `user_status.id` | SQL |
| `login_codes` | `user_id` | `users.id` | SQL |
| `reset_password_codes` | `user_id` | `users.id` | SQL |
| `listings` | `seller_id` | `users.id` | SQL |
| `listings` | `assigned_to_id` | `users.id` | SQL |
| `listings` | `status_id` | `statuses.id` | SQL |
| `status_updates` | `listing_id` | `listings.id` | SQL |
| `status_updates` | `previous_status_id` | `statuses.id` | SQL |
| `status_updates` | `current_status_id` | `statuses.id` | SQL |
| `listing_photos` | `listing_id` | `listings.id` | SQL |
| `damaged_parts` | `listing_id` | `listings.id` | SQL |
| `offers` | `listing_id` | `listings.id` | SQL |
| `offers` | `dealer_id` | `users.id` | SQL |
| `invoices` | `listing_id` | `listings.id` | SQL |
| `invoices` | `dealer_id` | `users.id` | SQL |
| `saved_listings` | `user_id` | `users.id` | SQL |
| `saved_listings` | `listing_id` | `listings.id` | SQL |
| `user_activities` | `user_id` | `users.id` | SQL |
| `user_activities` | `listing_id` | `listings.id` | SQL |
| `wishlist_options` | `user_id` | `users.id` | SQL |
| `wishlist_options` | `listing_id` | `listingsitea_adverts.id` | SQL |
| `wishlist_clicks` | `wishlist_option_id` | `wishlist_options.id` | SQL |
| `wishlist_clicks` | `user_id` | `users.id` | SQL |
| `wishlist_clicks` | `listing_id` | — | ORM (no FK; may be platform listing or scraped advert) |
| `newsletter_contacts` | `country_id` | `countries.id` | SQL |
| `newsletters` | `newsletter_contact_id` | `newsletter_contacts.id` | SQL |
| `newsletters` | `listing_id` | `listings.id` | SQL |
| `user_report_options` | `user_id` | `users.id` | SQL |
| `weekly_report_emails` | `user_id` | `users.id` | SQL |
| `user_wishlist_sending_options` | `user_id` | `users.id` | SQL |
| `wishlist_emails` | `user_id` | `users.id` | SQL |
| `listingsitea_adverts` | `seller_id` | `users.id` | SQL |
| `listingsitea_inventory` | `seller_id` | `users.id` | SQL |
| `blogs` | `author_id` | `users.id` | SQL |
