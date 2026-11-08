-- ============================================================
--  Roman Beauty - storefront schema
--  Run this in Supabase → SQL Editor (or `supabase db push`).
--  Safe to re-run: every statement is idempotent.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- Catalog -----------------------------------------

create table if not exists public.collections (
  id          uuid primary key default gen_random_uuid(),
  handle      text not null unique,
  title       text not null,
  description text default '',
  image       text,
  position    integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  handle           text not null unique,
  title            text not null,
  subtitle         text,
  price            numeric(10, 2) not null default 0,
  compare_at_price numeric(10, 2),
  category         text default '',
  badge            text,
  sold_out         boolean not null default false,
  featured         boolean not null default false,
  description      text default '',
  options          jsonb not null default '[]'::jsonb,
  details          jsonb not null default '[]'::jsonb,
  metadata         jsonb not null default '{}'::jsonb,
  position         integer not null default 0,
  created_at       timestamptz not null default now()
);

create table if not exists public.product_images (
  id         bigserial primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  src        text not null,
  alt        text default '',
  position   integer not null default 0
);

create table if not exists public.product_variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title      text not null,
  options    jsonb not null default '{}'::jsonb,
  price      numeric(10, 2),
  available  boolean not null default true,
  position   integer not null default 0
);

create table if not exists public.product_collections (
  product_id    uuid not null references public.products(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  primary key (product_id, collection_id)
);

create table if not exists public.articles (
  id         uuid primary key default gen_random_uuid(),
  handle     text not null unique,
  title      text not null,
  excerpt    text default '',
  image      text default '',
  date       date,
  author     text default 'Roman Beauty',
  content    text default '',
  created_at timestamptz not null default now()
);

-- ---------- Orders ------------------------------------------

create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  email        text not null,
  full_name    text not null,
  phone        text,
  address      jsonb not null default '{}'::jsonb,
  subtotal     numeric(10, 2) not null default 0,
  shipping     numeric(10, 2) not null default 0,
  total        numeric(10, 2) not null default 0,
  currency     text not null default 'AED',
  status       text not null default 'pending',
  notes        text,
  created_at   timestamptz not null default now()
);

create table if not exists public.order_items (
  id         bigserial primary key,
  order_id   uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  handle     text not null,
  title      text not null,
  variant    text,
  unit_price numeric(10, 2) not null default 0,
  quantity   integer not null default 1,
  image      text
);

create table if not exists public.newsletter_subscribers (
  id         bigserial primary key,
  email      text not null unique,
  consent    boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Indexes -----------------------------------------

create index if not exists idx_products_position on public.products(position);
create index if not exists idx_product_images_product on public.product_images(product_id);
create index if not exists idx_product_collections_collection on public.product_collections(collection_id);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- ---------- Row level security ------------------------------

alter table public.collections            enable row level security;
alter table public.products               enable row level security;
alter table public.product_images         enable row level security;
alter table public.product_variants       enable row level security;
alter table public.product_collections    enable row level security;
alter table public.articles               enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Public catalog is read-only.
drop policy if exists "Public read collections" on public.collections;
create policy "Public read collections" on public.collections for select using (true);

drop policy if exists "Public read products" on public.products;
create policy "Public read products" on public.products for select using (true);

drop policy if exists "Public read product images" on public.product_images;
create policy "Public read product images" on public.product_images for select using (true);

drop policy if exists "Public read product variants" on public.product_variants;
create policy "Public read product variants" on public.product_variants for select using (true);

drop policy if exists "Public read product collections" on public.product_collections;
create policy "Public read product collections" on public.product_collections for select using (true);

drop policy if exists "Public read articles" on public.articles;
create policy "Public read articles" on public.articles for select using (true);

-- Guests may place an order, but never read the orders table back.
drop policy if exists "Guests can place orders" on public.orders;
create policy "Guests can place orders" on public.orders for insert with check (true);

drop policy if exists "Guests can place order items" on public.order_items;
create policy "Guests can place order items" on public.order_items for insert with check (true);

drop policy if exists "Guests can subscribe" on public.newsletter_subscribers;
create policy "Guests can subscribe" on public.newsletter_subscribers for insert with check (true);

-- The server-side service-role key bypasses RLS, so the checkout API,
-- the admin panel and the seed script never need extra policies.

-- ---------- Storage (images uploaded from /admin) -----------
-- Creates the public bucket used by the admin image uploader. Writes are
-- performed with the service-role key, so only public read is needed here.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read product images bucket" on storage.objects;
create policy "Public read product images bucket" on storage.objects
  for select using (bucket_id = 'product-images');
