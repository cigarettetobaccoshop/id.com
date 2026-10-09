
create or replace function public.admin_dashboard_snapshot(
  p_status text default null,
  p_limit integer default 50
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_limit integer := least(greatest(coalesce(p_limit, 50), 1), 100);
  v_orders jsonb := '[]'::jsonb;
  v_stats jsonb;
  v_database jsonb;
  v_images jsonb;
begin
  if v_user is null or v_user <> '60c5525a-d68a-4b0f-b7fd-b9bd2371bf4a'::uuid then
    raise exception 'ADMIN_ACCESS_DENIED';
  end if;

  if p_status is not null and p_status not in ('pending','confirmed','shipped','completed','cancelled') then
    raise exception 'INVALID_STATUS_FILTER';
  end if;

  select coalesce(jsonb_agg(to_jsonb(x)), '[]'::jsonb)
    into v_orders
  from (
    select
      o.id,
      o.order_code,
      o.customer_name,
      o.customer_phone,
      o.email,
      o.address,
      o.city,
      o.province,
      o.postal_code,
      o.ekspedisi,
      o.payment_method,
      o.items,
      o.subtotal,
      o.shipping_cost,
      o.total,
      o.status,
      o.notes,
      o.created_at,
      o.updated_at
    from public.orders o
    where p_status is null or o.status = p_status
    order by o.created_at desc
    limit v_limit
  ) x;

  select jsonb_build_object(
    'total_orders', count(*)::integer,
    'today_orders', count(*) filter (where o.created_at >= date_trunc('day', now()))::integer,
    'pending', count(*) filter (where o.status = 'pending')::integer,
    'confirmed', count(*) filter (where o.status = 'confirmed')::integer,
    'shipped', count(*) filter (where o.status = 'shipped')::integer,
    'completed', count(*) filter (where o.status = 'completed')::integer,
    'cancelled', count(*) filter (where o.status = 'cancelled')::integer,
    'total_sales', coalesce(sum(o.total) filter (where o.status <> 'cancelled'), 0)::numeric
  )
  into v_stats
  from public.orders o;

  select jsonb_build_object(
    'products', (select count(*)::integer from public.products),
    'active_products', (select count(*)::integer from public.products where is_active = true),
    'product_images', (select count(*)::integer from public.product_images),
    'verified_images', (select count(*)::integer from public.product_images where verification_status = 'verified'),
    'pending_images', (select count(*)::integer from public.product_images where verification_status = 'pending'),
    'rejected_images', (select count(*)::integer from public.product_images where verification_status = 'rejected'),
    'orders', (select count(*)::integer from public.orders),
    'newsletter_subscribers', (select count(*)::integer from public.newsletter_subscribers),
    'conversations', (select count(*)::integer from public.conversations),
    'messages', (select count(*)::integer from public.messages)
  )
  into v_database;

  select jsonb_build_object(
    'verified', (select count(*)::integer from public.product_images where verification_status = 'verified'),
    'pending', (select count(*)::integer from public.product_images where verification_status = 'pending'),
    'rejected', (select count(*)::integer from public.product_images where verification_status = 'rejected')
  )
  into v_images;

  return jsonb_build_object(
    'ok', true,
    'generated_at', now(),
    'orders', v_orders,
    'stats', v_stats,
    'database', v_database,
    'image_integrity', v_images
  );
end;
$$;

create or replace function public.admin_update_order_status(
  p_order_id uuid,
  p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_current public.orders%rowtype;
  v_updated public.orders%rowtype;
begin
  if v_user is null or v_user <> '60c5525a-d68a-4b0f-b7fd-b9bd2371bf4a'::uuid then
    raise exception 'ADMIN_ACCESS_DENIED';
  end if;

  if p_order_id is null or p_status is null or p_status not in ('pending','confirmed','shipped','completed','cancelled') then
    raise exception 'INVALID_ORDER_STATUS';
  end if;

  select * into v_current
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  if v_current.status = p_status then
    return jsonb_build_object('ok', true, 'unchanged', true, 'order', to_jsonb(v_current));
  end if;

  update public.orders
  set status = p_status, updated_at = now()
  where id = p_order_id
  returning * into v_updated;

  return jsonb_build_object('ok', true, 'unchanged', false, 'order', to_jsonb(v_updated));
end;
$$;

revoke all on function public.admin_dashboard_snapshot(text, integer) from public, anon, authenticated;
revoke all on function public.admin_update_order_status(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_dashboard_snapshot(text, integer) to authenticated;
grant execute on function public.admin_update_order_status(uuid, text) to authenticated;
