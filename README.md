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
```

Replace every value with the real MySQL credentials. The application uses this variable from `prisma/schema.prisma`.

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
