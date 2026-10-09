drop policy if exists orders_select_own on public.orders;

create index if not exists idx_products_active_category on public.products (category) where is_active = true;
create index if not exists idx_products_active_segment on public.products (segment) where is_active = true;
