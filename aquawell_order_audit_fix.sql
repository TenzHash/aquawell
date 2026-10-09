-- AquaWell targeted fixes for customer-order subtotal compatibility and admin audit logging.
-- SAFE TO REVIEW BEFORE EXECUTION. This script does not touch Auth users or delete business data.

begin;

-- 1) Make customer order placement compatible with either a normal subtotal column
--    or a PostgreSQL generated subtotal column.
create or replace function public.place_customer_order(
  p_order_id text,
  p_customer_id uuid,
  p_inventory_id integer,
  p_quantity integer,
  p_type text,
  p_address text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_product public.inventory%rowtype;
  v_total numeric;
  v_subtotal_generated boolean;
begin
  if auth.uid() is null or auth.uid() <> p_customer_id then
    raise exception 'You may only place orders for your own account';
  end if;

  if p_quantity is null or p_quantity <= 0 then
    raise exception 'Quantity must be greater than zero';
  end if;

  if p_type not in ('Delivery','Pickup') then
    raise exception 'Invalid fulfillment type';
  end if;

  select * into v_product
  from public.inventory
  where id = p_inventory_id
  for update;

  if not found then
    raise exception 'Selected product no longer exists';
  end if;

  if v_product.stock < p_quantity then
    raise exception 'Insufficient stock';
  end if;

  v_total := v_product.price * p_quantity;

  insert into public.orders (
    id, customer_id, type, address, total, status, payment_status
  ) values (
    p_order_id,
    p_customer_id,
    p_type,
    case when p_type = 'Delivery' then nullif(trim(coalesce(p_address,'')), '') else null end,
    v_total,
    'PENDING',
    'UNPAID'
  );

  select (is_generated = 'ALWAYS')
    into v_subtotal_generated
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'order_items'
    and column_name = 'subtotal';

  if coalesce(v_subtotal_generated, false) then
    -- Generated column: PostgreSQL calculates subtotal automatically.
    execute '
      insert into public.order_items (order_id, inventory_id, quantity, unit_price)
      values ($1, $2, $3, $4)'
      using p_order_id, p_inventory_id, p_quantity, v_product.price;
  else
    -- Normal column: explicitly persist the calculated subtotal.
    execute '
      insert into public.order_items (order_id, inventory_id, quantity, unit_price, subtotal)
      values ($1, $2, $3, $4, $5)'
      using p_order_id, p_inventory_id, p_quantity, v_product.price, v_total;
  end if;

  update public.inventory
  set stock = stock - p_quantity
  where id = p_inventory_id;

  insert into public.notifications (
    title, description, unread, user_id, order_id
  ) values (
    'New order received',
    'Your order ' || p_order_id || ' has been placed successfully.',
    true,
    p_customer_id,
    p_order_id
  );

  return jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'total', v_total
  );
end;
$$;

revoke execute on function public.place_customer_order(text, uuid, integer, integer, text, text) from public, anon, authenticated;
grant execute on function public.place_customer_order(text, uuid, integer, integer, text, text) to authenticated;

-- 2) Normalize audit timestamps BEFORE INSERT without replacing the existing
--    AFTER INSERT audit trigger. This preserves any existing notification behavior.
--    A separate trigger is used so the existing on_audit_log_created trigger remains intact.
create or replace function public.normalize_audit_log_timestamps()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.created_at is null then
    new.created_at := now();
  end if;

  if new.timestamp is null or btrim(new.timestamp) = '' then
    new.timestamp := to_char(
      new.created_at at time zone 'UTC',
      'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
    );
  end if;

  return new;
end;
$$;

revoke execute on function public.normalize_audit_log_timestamps() from public, anon, authenticated;

drop trigger if exists before_audit_log_timestamp on public.audit_logs;
create trigger before_audit_log_timestamp
before insert on public.audit_logs
for each row
execute function public.normalize_audit_log_timestamps();

-- IMPORTANT: Do not drop/recreate on_audit_log_created here. The existing AFTER
-- INSERT trigger is intentionally preserved so its notification behavior continues.

commit;
