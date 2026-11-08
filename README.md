# Roman Beauty — storefront

A Next.js 15 storefront for Roman Beauty: salon-grade hair tools, human hair extensions, coloured contact lenses and body rituals, dispatched from Dubai.

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

## Admin panel

The storefront is also editable through a small password-protected panel at `/admin`.

| Route | Description |
| --- | --- |
| `/admin/login` | Password sign-in (cookie session, 12 hours) |
| `/admin` | Dashboard with catalog counters and recent orders |
| `/admin/products` | Product list, create, edit, delete and image upload |
| `/admin/collections` | Create and edit collections |
| `/admin/articles` | Create and edit journal articles |
| `/admin/orders` | Orders with line items and status updates |
| `/admin/subscribers` | Newsletter list with CSV export |

The panel needs the Supabase service-role key and an `ADMIN_PASSWORD` (see below). It writes with the service-role client, so the site's public RLS policies stay read-only for catalog data. Uploaded images go to the public `product-images` Storage bucket created by `supabase/schema.sql`.

Catalog pages use incremental static regeneration: `revalidate = 30` covers normal traffic, and every admin write calls `revalidatePath` so edits appear immediately without a rebuild.

## Supabase setup (optional)

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql`. It creates the catalog, articles, newsletter and order tables, the `product-images` Storage bucket, and row-level security policies.
3. Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=choose-a-long-password
ADMIN_SESSION_SECRET=optional-random-string
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`ADMIN_SESSION_SECRET` is optional; when empty the session cookie is signed with `ADMIN_PASSWORD`. Change `ADMIN_PASSWORD` to invalidate every existing admin session.

4. Seed the catalog:

```bash
npm run seed
```

The seed script reads `data/catalog.json` and writes collections, products, images, options, article content and collection relations.

5. Restart the server and sign in at http://localhost:3000/admin/login.

> Environment values are normalised at runtime (`lib/supabase-env.ts`, `lib/site-url.ts`). Quotes around a value and a missing `https://` are tolerated, and an invalid or blank value is treated as "not configured" so a bad dashboard entry cannot break a deployment. Still, use `https://` in `NEXT_PUBLIC_SITE_URL` so canonical URLs are correct.

### How the fallback works

- `lib/data.ts` reads from Supabase when the public URL and anon key are configured. If a query fails or returns no rows, it falls back to `data/catalog.json`.
- `lib/supabase-admin.ts` uses the service-role key on the server only. Checkout and newsletter writes are skipped gracefully when it is not configured, so the storefront can be demonstrated without a database.
- Without Supabase, checkout still validates the bag, re-prices it server-side and returns a demo order number. No payment is taken.
- Newsletter sign-ups and orders succeed in demo mode with `persisted: false`.

## Project structure

```
app/(store)/         Storefront routes (sidebar, drawers, footer layout)
app/admin/           Password-protected admin panel
app/api/             Storefront and admin API routes
components/          Storefront UI (client and server components)
components/admin/    Admin forms and tables
data/catalog.json    Static catalog fallback
lib/                 Data access, formatting and Supabase clients
public/images/       Product and editorial imagery
scripts/seed.mjs     Supabase seed script
supabase/schema.sql  Database schema, storage bucket and policies
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
- Bag and wishlist are kept in `localStorage` (`roman.cart.v1`, `roman.wishlist.v1`). Order history is kept in `roman.orders.v1` for the account preview. Data saved under the old `youmi.*` keys is migrated automatically on first load.
- Checkout is intentionally a confirmation flow: no payment provider is connected. Add a payment gateway before taking live orders.
- Update `NEXT_PUBLIC_SITE_URL` in production so canonical URLs, Open Graph metadata, `sitemap.xml` and `robots.txt` point at the live domain.

## Security

- Admin sessions use an HMAC-signed, `httpOnly` cookie (`roman_admin`, 12h). Sessions issued under the old `youmi_admin` cookie stay valid until they expire. `Secure` is set from the request protocol, so HTTP works locally and HTTPS is enforced in production.
- `/api/admin/login` allows 5 failed attempts per IP per 10 minutes, then answers `429` with `Retry-After`. The counter is in-memory on the serverless instance; for a shared limit across instances, swap `lib/rate-limit.ts` for a Redis-backed store.
- `next.config.ts` sets `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and a CSP restricted to the site itself plus the Supabase project (`img-src`/`connect-src`). If you add analytics, a payment gateway or a new asset host, extend the CSP lists.
- Every `/api/admin/*` route requires a valid session; catalogue reads are public, orders and newsletter subscribers are not readable with the anon key.
- Rotate `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PASSWORD` before sharing the site with the client, and keep `/admin` out of anything you send them.

