-- R2 NUSANTARA: repair inventory reservation expiry workflow.
-- The previous function attempted to set orders.status='expired', but the live
-- orders table does not permit that value. This caused every new checkout to
-- fail whenever an expired reservation existed.

create or replace function public.release_expired_inventory_reservations()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  released integer := 0;
begin
  for r in
    select ir.id, ir.order_id, ir.sku, ir.qty
    from public.inventory_reservations ir
    where ir.status = 'reserved'
      and ir.expires_at <= now()
    for update skip locked
  loop
    update public.products
      set variant_inventory_qty = coalesce(variant_inventory_qty, 0) + r.qty
      where variant_sku = r.sku;

    update public.inventory_reservations
      set status = 'released', released_at = now()
      where id = r.id and status = 'reserved';

    update public.orders
      set status = 'cancelled', fulfillment_status = 'cancelled'
      where id = r.order_id
        and status in ('pending', 'confirmed', 'processing');

    released := released + 1;
  end loop;

  return released;
end;
$$;

-- Repair any reservation already expired at migration time.
do $$
declare
  r record;
begin
  for r in
    select ir.id, ir.order_id, ir.sku, ir.qty
    from public.inventory_reservations ir
    where ir.status = 'reserved'
      and ir.expires_at <= now()
    for update skip locked
  loop
    update public.products
      set variant_inventory_qty = coalesce(variant_inventory_qty, 0) + r.qty
      where variant_sku = r.sku;

    update public.inventory_reservations
      set status = 'released', released_at = now()
      where id = r.id and status = 'reserved';

    update public.orders
      set status = 'cancelled', fulfillment_status = 'cancelled'
      where id = r.order_id
        and status in ('pending', 'confirmed', 'processing');
  end loop;
end;
$$;
