-- 0005_rls_policies.sql

alter table profiles      enable row level security;
alter table bookings      enable row level security;
alter table sessions      enable row level security;
alter table orders        enable row level security;
alter table order_items   enable row level security;
alter table bills         enable row level security;
alter table expenses      enable row level security;
alter table site_content  enable row level security;
alter table audit_log     enable row level security;
alter table booked_slots  enable row level security;
alter table game_tables   enable row level security;
alter table pricing       enable row level security;
alter table menu_items    enable row level security;

create or replace function my_role()
returns user_role language sql stable security definer set search_path = public as $$
  select coalesce((select role from profiles where id = auth.uid()), 'customer'::user_role);
$$;

-- Public read (safe, PII-free)
create policy "public read slots"   on booked_slots for select using (true);
create policy "public read tables"  on game_tables  for select using (active = true);
create policy "public read pricing" on pricing      for select using (true);
create policy "public read menu"    on menu_items   for select using (available = true);
create policy "public read content" on site_content for select using (true);

-- Customers / Authenticated users
create policy "select own profile"  on profiles for select using (id = auth.uid() or my_role() in ('staff','owner'));
create policy "update own profile (no role)" on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from profiles where id = auth.uid()));

create policy "select own bookings" on bookings for select
  using (user_id = auth.uid() or my_role() in ('staff','owner'));

create policy "select own sessions" on sessions for select using (
  exists (select 1 from bookings b where b.id = booking_id and b.user_id = auth.uid()) or my_role() in ('staff','owner')
);

create policy "select own bills" on bills for select using (
  exists (
    select 1 from sessions s
    join bookings b on b.id = s.booking_id
    where s.id = bills.session_id and b.user_id = auth.uid()
  ) or my_role() in ('staff', 'owner')
);

-- Staff & Owner policies
create policy "staff manage tables" on game_tables for all
  using (my_role() in ('staff', 'owner'))
  with check (my_role() in ('staff', 'owner'));

create policy "staff manage menu" on menu_items for all
  using (my_role() in ('staff', 'owner'))
  with check (my_role() in ('staff', 'owner'));

create policy "staff manage orders" on orders for all
  using (my_role() in ('staff', 'owner'))
  with check (my_role() in ('staff', 'owner'));

create policy "staff manage order items" on order_items for all
  using (my_role() in ('staff', 'owner'))
  with check (my_role() in ('staff', 'owner'));

-- Owner exclusive policies
create policy "owner manage expenses" on expenses for all
  using (my_role() = 'owner')
  with check (my_role() = 'owner');

create policy "owner manage pricing" on pricing for all
  using (my_role() = 'owner')
  with check (my_role() = 'owner');

create policy "owner content write" on site_content for all
  using (my_role() = 'owner')
  with check (my_role() = 'owner');

create policy "owner audit read" on audit_log for select
  using (my_role() = 'owner');

-- Ensure direct mutation is blocked for regular clients (mutations must run via validated RPCs)
revoke insert, update, delete on bookings, sessions, bills, order_items from anon, authenticated;
