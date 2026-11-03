# Youmi Beauty — storefront

A Next.js 15 storefront for Youmi Beauty: salon-grade hair tools, human hair extensions, coloured contact lenses and body rituals, dispatched from Dubai.

The site runs **without a database** out of the box using `data/catalog.json`. Connect Supabase when you want the CMS-style catalog, newsletter subscribers and order records to persist.

## Requirements

- Node.js 20+
- npm

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Production build:

```bash
npm run build
npm start
```

## Pages

| Route | Description |
| --- | --- |
| `/` | Home with hero, best sellers, lenses, shop the look, journal |
| `/collections/[handle]` | Collection listing with sort and load more |
| `/products/[handle]` | Product detail with gallery, options, wishlist and accordions |
| `/search?q=` | Full search results |
| `/cart` | Bag with quantity controls and free-shipping progress |
| `/checkout` | Checkout form with demo/Supabase order handling |
| `/account` | Sign-in / register preview and local order history |
| `/wishlist` | Saved products |
| `/blogs/organization-blog` | Journal index |
| `/blogs/organization-blog/[handle]` | Journal article |
| `/pages/[handle]` | About, FAQ, press, wholesale, affiliate |
| `/policies/[handle]` | Privacy, refund and shipping policies |

API routes:

- `GET /api/search?q=` — product search used by the search drawer
- `POST /api/newsletter` — newsletter opt-in
- `POST /api/checkout` — server-side re-priced order

## Supabase setup (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql`. It creates the catalog, articles, newsletter and order tables plus row-level security policies.
3. Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Seed the catalog:

```bash
npm run seed
```

The seed script reads `data/catalog.json` and writes collections, products, images, options, article content and collection relations.

### How the fallback works

- `lib/data.ts` reads from Supabase when the public URL and anon key are configured. If a query fails or returns no rows, it falls back to `data/catalog.json`.
- `lib/supabase-admin.ts` uses the service-role key on the server only. Checkout and newsletter writes are skipped gracefully when it is not configured, so the storefront can be demonstrated without a database.
- Without Supabase, checkout still validates the bag, re-prices it server-side and returns a demo order number. No payment is taken.
- Newsletter sign-ups and orders succeed in demo mode with `persisted: false`.

## Project structure

```
app/                 App Router pages and API routes
components/          Storefront UI (client and server components)
data/catalog.json    Static catalog fallback
lib/                 Data access, formatting, content and Supabase client
public/images/       Product and editorial imagery
scripts/seed.mjs     Supabase seed script
supabase/schema.sql  Database schema and policies
```

## QA helper

`scripts/qa-layout.mjs` checks every page at mobile, tablet and desktop widths for horizontal overflow, missing `<h1>`s and broken images. Start Chrome with a debugging port and then run it:

```bash
chrome --headless=new --remote-debugging-port=9222 about:blank
node scripts/qa-layout.mjs http://localhost:3000
```

## Notes for launch

- Product prices are stored in AED and displayed as `Dhs. X.XX`.
- Shipping is complimentary at Dhs. 300 and above; otherwise Dhs. 25.
- Bag and wishlist are kept in `localStorage` (`youmi.cart.v1`, `youmi.wishlist.v1`). Order history is kept in `youmi.orders.v1` for the account preview.
- Checkout is intentionally a confirmation flow: no payment provider is connected. Add a payment gateway before taking live orders.
- Update `NEXT_PUBLIC_SITE_URL` in production so canonical URLs, Open Graph metadata, `sitemap.xml` and `robots.txt` point at the live domain.
