-- ============ PRODUCTS ============
create table products (
  id text primary key,
  name text not null,
  price integer not null,
  category text not null check (category in ('r2','resmi')),
  segment text,
  segment_name text,
  description text,
  rating numeric(2,1),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_products_category on products(category);
create index idx_products_segment on products(segment);

-- ============ ORDERS ============
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null default ('R2-' || to_char(now(), 'YYMMDD') || '-' || substr(md5(random()::text), 1, 5)),
  customer_name text not null,
  customer_phone text not null,
  address text not null,
  city text not null,
  province text not null,
  postal_code text not null,
  ekspedisi text not null,
  payment_method text not null,
  admin_number text not null,
  items jsonb not null,
  subtotal integer not null,
  status text not null default 'pending' check (status in ('pending','confirmed','shipped','completed','cancelled')),
  created_at timestamptz not null default now()
);
create index idx_orders_status on orders(status);
create index idx_orders_created_at on orders(created_at desc);

-- ============ NEWSLETTER ============
create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

-- ============ ROW LEVEL SECURITY ============
alter table products enable row level security;
alter table orders enable row level security;
alter table newsletter_subscribers enable row level security;

-- Produk: siapa saja boleh baca produk aktif, tidak ada yang boleh tulis dari client publik
create policy "Public read active products" on products
  for select using (is_active = true);

-- Order: siapa saja (customer) boleh membuat order baru, tapi TIDAK boleh membaca/mengubah order siapa pun (termasuk miliknya sendiri) dari client publik — hanya lewat service role/admin dashboard
create policy "Public can insert orders" on orders
  for insert with check (true);

-- Newsletter: siapa saja boleh daftar, tidak ada yang boleh membaca daftar email dari client publik
create policy "Public can subscribe" on newsletter_subscribers
  for insert with check (true);
