-- AquaWell / AquaTrack Supabase compatibility patch
-- Run this AFTER the tables supplied by the project are created.
-- The application expects orders.customer_id to reference profiles.id (UUID).

create index if not exists idx_customers_profile_id on public.customers(profile_id);
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_rider_id on public.orders(rider_id);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
create index if not exists idx_staff_profile_id on public.staff(profile_id);

-- Keep staff.profile_id one-to-one when an existing auth/profile account is linked.
create unique index if not exists uq_staff_profile_id
  on public.staff(profile_id)
  where profile_id is not null;

-- The application must never depend on the integer customers.customer_id for orders.
-- Existing bad rows cannot be repaired automatically without knowing their intended profile.
-- Inspect before deployment:
-- select id, customer_id from public.orders;

-- Useful role helpers. These read staff rather than profiles, avoiding recursive RLS checks on profiles.
create or replace function public.current_staff_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select lower(s.role)
  from public.staff s
  where s.profile_id = auth.uid()
     or lower(s.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  order by case when s.profile_id = auth.uid() then 0 else 1 end
  limit 1;
$$;

grant execute on function public.current_staff_role() to authenticated;

-- RLS policies. These are intentionally straightforward and match the current frontend modules.
-- If you already have stricter policies, review/merge these instead of blindly replacing them.
alter table public.profiles enable row level security;
alter table public.inventory enable row level security;
alter table public.customers enable row level security;
alter table public.staff enable row level security;
alter table public.orders enable row level security;
alter table public.sales enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

-- Profiles
 drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
using (
  id = auth.uid()
  or public.current_staff_role() in ('admin','staff','delivery')
);
 drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated
with check (id = auth.uid() or public.current_staff_role() = 'admin');
 drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
using (id = auth.uid() or public.current_staff_role() = 'admin')
with check (id = auth.uid() or public.current_staff_role() = 'admin');

-- Inventory
 drop policy if exists inventory_select on public.inventory;
create policy inventory_select on public.inventory for select to authenticated using (true);
 drop policy if exists inventory_manage on public.inventory;
create policy inventory_manage on public.inventory for all to authenticated
using (public.current_staff_role() in ('admin','staff'))
with check (public.current_staff_role() in ('admin','staff'));

-- Customers
 drop policy if exists customers_select on public.customers;
create policy customers_select on public.customers for select to authenticated
using (profile_id = auth.uid() or public.current_staff_role() in ('admin','staff','delivery'));
 drop policy if exists customers_insert on public.customers;
create policy customers_insert on public.customers for insert to authenticated
with check (profile_id = auth.uid() or public.current_staff_role() = 'admin');
 drop policy if exists customers_update on public.customers;
create policy customers_update on public.customers for update to authenticated
using (profile_id = auth.uid() or public.current_staff_role() = 'admin')
with check (profile_id = auth.uid() or public.current_staff_role() = 'admin');
 drop policy if exists customers_delete on public.customers;
create policy customers_delete on public.customers for delete to authenticated
using (public.current_staff_role() = 'admin');

-- Staff directory
 drop policy if exists staff_select on public.staff;
create policy staff_select on public.staff for select to authenticated using (true);
 drop policy if exists staff_manage on public.staff;
create policy staff_manage on public.staff for all to authenticated
using (public.current_staff_role() = 'admin')
with check (public.current_staff_role() = 'admin');

-- Orders
 drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders for select to authenticated
using (
  customer_id = auth.uid()
  or public.current_staff_role() in ('admin','staff')
  or (public.current_staff_role() = 'delivery' and rider_id in (
    select s.staff_id from public.staff s where s.profile_id = auth.uid()
  ))
);
 drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders for insert to authenticated
with check (customer_id = auth.uid() or public.current_staff_role() in ('admin','staff'));
 drop policy if exists orders_update on public.orders;
create policy orders_update on public.orders for update to authenticated
using (
  customer_id = auth.uid()
  or public.current_staff_role() in ('admin','staff')
  or (public.current_staff_role() = 'delivery' and rider_id in (
    select s.staff_id from public.staff s where s.profile_id = auth.uid()
  ))
)
with check (
  customer_id = auth.uid()
  or public.current_staff_role() in ('admin','staff')
  or (public.current_staff_role() = 'delivery' and rider_id in (
    select s.staff_id from public.staff s where s.profile_id = auth.uid()
  ))
);
 drop policy if exists orders_delete on public.orders;
create policy orders_delete on public.orders for delete to authenticated
using (public.current_staff_role() = 'admin');

-- Order items
 drop policy if exists order_items_select on public.order_items;
create policy order_items_select on public.order_items for select to authenticated
using (exists (select 1 from public.orders o where o.id = order_items.order_id));
 drop policy if exists order_items_manage on public.order_items;
create policy order_items_manage on public.order_items for all to authenticated
using (public.current_staff_role() in ('admin','staff') or exists (
  select 1 from public.orders o where o.id = order_items.order_id and o.customer_id = auth.uid()
))
with check (public.current_staff_role() in ('admin','staff') or exists (
  select 1 from public.orders o where o.id = order_items.order_id and o.customer_id = auth.uid()
));

-- Payments
 drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments for select to authenticated
using (exists (select 1 from public.orders o where o.id = payments.order_id));
 drop policy if exists payments_manage on public.payments;
create policy payments_manage on public.payments for all to authenticated
using (public.current_staff_role() in ('admin','staff'))
with check (public.current_staff_role() in ('admin','staff'));

-- Sales
 drop policy if exists sales_select on public.sales;
create policy sales_select on public.sales for select to authenticated
using (public.current_staff_role() in ('admin','staff'));
 drop policy if exists sales_manage on public.sales;
create policy sales_manage on public.sales for all to authenticated
using (public.current_staff_role() in ('admin','staff'))
with check (public.current_staff_role() in ('admin','staff'));

-- Notifications
 drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications for select to authenticated
using (user_id = auth.uid() or public.current_staff_role() in ('admin','staff'));
 drop policy if exists notifications_manage on public.notifications;
create policy notifications_manage on public.notifications for all to authenticated
using (user_id = auth.uid() or public.current_staff_role() in ('admin','staff'))
with check (user_id = auth.uid() or public.current_staff_role() in ('admin','staff'));

-- Audit logs
 drop policy if exists audit_logs_select on public.audit_logs;
create policy audit_logs_select on public.audit_logs for select to authenticated
using (public.current_staff_role() = 'admin');
 drop policy if exists audit_logs_insert on public.audit_logs;
create policy audit_logs_insert on public.audit_logs for insert to authenticated
with check (public.current_staff_role() = 'admin');

-- IMPORTANT: after applying this, verify your existing orders. Any row whose customer_id is not a UUID
-- matching profiles.id must be corrected before that order can be displayed/updated reliably.


-- Atomic customer order placement. This keeps stock changes server-side and prevents
-- customers from needing direct UPDATE permission on inventory.
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
set search_path = public
as $$
declare
  v_product public.inventory%rowtype;
  v_total numeric;
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
    p_order_id, p_customer_id, p_type,
    case when p_type = 'Delivery' then nullif(trim(coalesce(p_address,'')), '') else null end,
    v_total, 'PENDING', 'UNPAID'
  );

  insert into public.order_items (
    order_id, inventory_id, quantity, unit_price, subtotal
  ) values (
    p_order_id, p_inventory_id, p_quantity, v_product.price, v_total
  );

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
exception
  when unique_violation then
    raise exception 'An order with this ID already exists. Please try again.';
end;
$$;

grant execute on function public.place_customer_order(text, uuid, integer, integer, text, text) to authenticated;
