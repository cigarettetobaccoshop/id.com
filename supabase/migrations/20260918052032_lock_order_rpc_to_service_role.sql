revoke execute on function public.create_order_atomic(text,text,text,text,text,text,text,text,text,text,jsonb,integer,integer,integer,integer,uuid) from public, anon, authenticated;
grant execute on function public.create_order_atomic(text,text,text,text,text,text,text,text,text,text,jsonb,integer,integer,integer,integer,uuid) to service_role;
