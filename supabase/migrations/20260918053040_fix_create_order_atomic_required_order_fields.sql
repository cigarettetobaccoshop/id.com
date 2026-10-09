create or replace function public.create_order_atomic(
  p_order_number text,
  p_customer_name text,
  p_whatsapp text,
  p_email text,
  p_address text,
  p_city text,
  p_postal_code text,
  p_courier text,
  p_payment_method text,
  p_notes text,
  p_items jsonb,
  p_subtotal integer,
  p_shipping_cost integer,
  p_total integer,
  p_reservation_minutes integer default 30,
  p_user_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_order_id uuid;
begin
  insert into public.orders (
    order_code, customer_name, customer_phone, email, address, city, province,
    postal_code, ekspedisi, payment_method, admin_number, items, subtotal,
    shipping_cost, total, status, created_at, updated_at, notes
  ) values (
    p_order_number, p_customer_name, p_whatsapp, nullif(p_email,''),
    p_address, coalesce(nullif(p_city,''),'-'), coalesce(nullif(p_city,''),'-'),
    coalesce(nullif(p_postal_code,''),'-'), p_courier, p_payment_method, '',
    coalesce(p_items,'[]'::jsonb), greatest(p_subtotal,0),
    greatest(p_shipping_cost,0), greatest(p_total,0), 'pending', now(), now(),
    nullif(p_notes,'')
  )
  returning id into v_order_id;

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', p_order_number,
    'reservation_expires_at', null
  );
end;
$function$;

revoke execute on function public.create_order_atomic(text,text,text,text,text,text,text,text,text,text,jsonb,integer,integer,integer,integer,uuid) from public, anon, authenticated;
grant execute on function public.create_order_atomic(text,text,text,text,text,text,text,text,text,text,jsonb,integer,integer,integer,integer,uuid) to service_role;
