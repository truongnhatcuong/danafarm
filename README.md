# DanaFarm

A full-stack reconstruction of the DanaFarm storefront built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, and MySQL.

## Technology

- Next.js 16 App Router and React 19
- TypeScript (strict mode)
- Tailwind CSS 4
- Prisma ORM 6
- MySQL
- Zod for API validation
- Lucide React icons

## Requirements

- Node.js 24 (the project was validated with `v24.21.0`)
- npm
- A MySQL database

## Environment

Create or update `.env` in the project root:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE_NAME"

# Recommended in production: shared rate-limit storage
UPSTASH_REDIS_REST_URL="https://YOUR-DATABASE.upstash.io"
UPSTASH_REDIS_REST_TOKEN="YOUR_UPSTASH_REST_TOKEN"
```

Replace every value with the real credentials. `DATABASE_URL` is used by Prisma. The two Upstash variables enable distributed API rate limiting across all Next.js instances. If they are omitted, development still works with an in-memory fallback, but that fallback is not sufficient for horizontally scaled production deployments.

## Installation

```bash
npm install
```

The `postinstall` script automatically generates the Prisma client.

## Database setup

For initial local development, synchronize the schema directly:

```bash
npm run db:push
```

For a migration-based workflow:

```bash
npm run db:migrate
```

Load the initial DanaFarm catalog and content:

```bash
npm run db:seed
```

The seed is deterministic and rebuilds catalog/content tables while preserving contact messages and newsletter subscribers. Initial JSON content is stored in `prisma/data/` so it can be extended later without additional scraping.

Open Prisma Studio when database inspection is needed:

```bash
npm run db:studio
```

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Quality checks and production build

```bash
npm run lint
npx next typegen
npx tsc --noEmit
npm run build
npm run start
```

## Application routes

- `/` — homepage
- `/collections/[slug]` — product collection, including `/collections/all`
- `/products/[slug]` — product detail
- `/search?q=...` — product search
- `/blogs/news` — news listing
- `/blogs/news/[slug]` — article detail
- `/pages/[slug]` — introduction and policy content
- `/pages/lien-he` — contact page

## Route Handler APIs

- `GET /api/categories`
- `GET /api/products?category=&q=&featured=&page=&limit=&sort=`
- `GET /api/products/[slug]`
- `GET /api/posts?page=&limit=&featured=`
- `GET /api/posts/[slug]`
- `GET /api/pages/[slug]`
- `GET /api/banners`
- `POST /api/contact`

Contact request example:

```json
{
  "name": "Nguyen Van A",
  "email": "customer@example.com",
  "phone": "0901234567",
  "message": "I need product advice."
}
```

## API rate limiting and abuse protection

Sensitive write endpoints use endpoint-specific rate limits:

- Login: 10 attempts per 10 minutes per IP and 5 attempts per 15 minutes per hashed email.
- Registration: 5 attempts per hour per IP.
- Contact form: 5 submissions per hour per IP.
- Order creation: 8 attempts per minute per authenticated user and IP.
- Password changes: 5 attempts per 15 minutes per authenticated user.

Blocked requests return HTTP `429`, a JSON error with `code: "RATE_LIMITED"`, and standard `Retry-After` plus `X-RateLimit-*` headers. Email identifiers are SHA-256 hashed before being used as Redis keys.

Application rate limiting reduces brute force, spam, and expensive API abuse. It does not replace network-level DDoS protection. Production deployments should also enable Cloudflare WAF/Rate Limiting or Vercel Firewall so malicious traffic is rejected before it reaches the Next.js server. When using a custom reverse proxy, configure it to overwrite forwarded-IP headers rather than trusting values supplied directly by clients.

## Project structure

```text
prisma/
  data/                 Initial imported JSON content
  schema.prisma         MySQL database schema
  seed.ts               Idempotent seed workflow
src/
  app/                   App Router pages and API handlers
  components/
    contact/             Contact form
    home/                Homepage sections
    layout/              Header, footer, navigation
    post/                Article cards
    product/             Product cards, grids, variants
    ui/                  Shared UI primitives
  lib/                   Prisma client, constants, utilities
  types/                 Shared TypeScript contracts
```

## Content updates

Products, categories, posts, banners, pages, and image URLs are database-backed. Add or edit production content in MySQL through Prisma Studio or a future administrative interface. Update `prisma/data/*.json` only when changing the initial seed dataset.
