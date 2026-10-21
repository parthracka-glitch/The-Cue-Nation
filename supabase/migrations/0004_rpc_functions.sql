-- 0004_rpc_functions.sql

-- 1. Helper: compute_price based on pricing table and hours
create or replace function compute_price(p_table uuid, p_start timestamptz, p_end timestamptz)
returns numeric language plpgsql stable security definer set search_path = public as $$
declare
  v_table_type table_type;
  v_rate numeric(8,2);
  v_hours numeric;
  v_day_of_week int;
  v_time time;
begin
  select type into v_table_type from game_tables where id = p_table;
  if not found then raise exception 'TABLE_NOT_FOUND'; end if;

  v_day_of_week := extract(dow from p_start at time zone 'Asia/Kolkata');
  v_time := (p_start at time zone 'Asia/Kolkata')::time;

  -- Match pricing rule or fallback to standard rate
  select price_per_hour into v_rate from pricing
  where table_type = v_table_type
    and v_day_of_week = any(days)
    and v_time >= start_time and v_time < end_time
  limit 1;

  if v_rate is null then
    -- Default standard rate: 300 for pool, 450 for snooker
    if v_table_type = 'snooker' then v_rate := 450.00;
    else v_rate := 300.00;
    end if;
  end if;

  v_hours := round((extract(epoch from (p_end - p_start)) / 3600.0)::numeric, 2);
  return round((v_hours * v_rate)::numeric, 2);
end $$;

-- 2. Customer or staff creates booking. Returns plain PIN exactly once.
create or replace function create_booking(
  p_table uuid,
  p_start timestamptz,
  p_end timestamptz,
  p_guest_name text default null,
  p_guest_phone text default null,
  p_source booking_source default 'online'
)
returns table(booking_id uuid, booking_code text, pin text)
language plpgsql security definer set search_path = public as $$
declare
  v_pin text := lpad((floor(random()*1000000))::int::text, 6, '0');
  v_code text := 'CN-' || upper(encode(gen_random_bytes(4), 'hex'));
  v_role user_role;
  v_amount numeric;
  v_id uuid;
begin
  if p_start >= p_end or p_start < now() - interval '5 minutes' then
    raise exception 'INVALID_RANGE';
  end if;
  if p_end - p_start > interval '6 hours' then
    raise exception 'RANGE_TOO_LONG';
  end if;

  select role into v_role from profiles where id = auth.uid();
  if p_source = 'offline' and (v_role is null or v_role not in ('staff', 'owner')) then
    raise exception 'FORBIDDEN';
  end if;
  if p_source = 'online' and auth.uid() is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  v_amount := compute_price(p_table, p_start, p_end);

  insert into bookings(
    booking_code, user_id, guest_name, guest_phone,
    table_id, during, source, pin_hash, amount
  )
  values (
    v_code,
    case when p_source = 'online' then auth.uid() else null end,
    p_guest_name,
    p_guest_phone,
    p_table,
    tstzrange(p_start, p_end, '[)'),
    p_source,
    crypt(v_pin, gen_salt('bf', 10)),
    v_amount
  )
  returning id into v_id;

  insert into audit_log(actor, action, entity, entity_id, meta)
  values (
    auth.uid(),
    'booking.create',
    'booking',
    v_id::text,
    jsonb_build_object('source', p_source, 'table_id', p_table, 'amount', v_amount)
  );

  return query select v_id, v_code, v_pin;
end $$;

-- 3. Staff enters Booking Code + PIN to check-in and start table session
create or replace function start_session(p_code text, p_pin text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  b bookings;
  v_sid uuid;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role in ('staff', 'owner')) then
    raise exception 'FORBIDDEN';
  end if;

  select * into b from bookings where booking_code = p_code and status = 'confirmed' for update;
  if not found then
    raise exception 'NOT_FOUND';
  end if;

  if b.pin_attempts >= 5 then
    raise exception 'PIN_LOCKED';
  end if;

  if crypt(p_pin, b.pin_hash) <> b.pin_hash then
    update bookings set pin_attempts = pin_attempts + 1 where id = b.id;
    raise exception 'PIN_INVALID';
  end if;

  if now() < lower(b.during) - interval '15 minutes' then
    raise exception 'TOO_EARLY';
  end if;

  insert into sessions(booking_id, table_id, started_at)
  values (b.id, b.table_id, now())
  returning id into v_sid;

  update bookings set status = 'checked_in' where id = b.id;
  update game_tables set status = 'running' where id = b.table_id;

  insert into audit_log(actor, action, entity, entity_id)
  values (auth.uid(), 'session.start', 'session', v_sid::text);

  return v_sid;
end $$;

-- 4. Add extra minutes to active session with collision check
create or replace function add_extra_time(p_session uuid, p_minutes int, p_force boolean default false)
returns void language plpgsql security definer set search_path = public as $$
declare
  s sessions;
  b bookings;
  v_new tstzrange;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role in ('staff', 'owner')) then
    raise exception 'FORBIDDEN';
  end if;

  if p_minutes not between 5 and 180 then
    raise exception 'INVALID_MINUTES';
  end if;

  select * into s from sessions where id = p_session and ended_at is null for update;
  if not found then raise exception 'SESSION_NOT_FOUND'; end if;

  select * into b from bookings where id = s.booking_id;
  v_new := tstzrange(lower(b.during), upper(b.during) + make_interval(mins => p_minutes), '[)');

  if exists (
    select 1 from bookings
    where table_id = b.table_id and id <> b.id
      and status = 'confirmed' and during && v_new
  ) and not p_force then
    raise exception 'NEXT_BOOKING_CONFLICT';
  end if;

  update sessions set extra_minutes = extra_minutes + p_minutes where id = s.id;
  update bookings set during = v_new where id = b.id;

  insert into audit_log(actor, action, entity, entity_id, meta)
  values (auth.uid(), 'session.extra_time', 'session', p_session::text, jsonb_build_object('minutes', p_minutes));
end $$;

-- 5. End session and generate combined bill
create or replace function end_session(p_session uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  s sessions;
  b bookings;
  v_bill_id uuid;
  v_hourly_rate numeric;
  v_time_charge numeric;
  v_food_charge numeric := 0;
  v_actual_minutes int;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role in ('staff', 'owner')) then
    raise exception 'FORBIDDEN';
  end if;

  select * into s from sessions where id = p_session and ended_at is null for update;
  if not found then raise exception 'SESSION_NOT_FOUND'; end if;

  select * into b from bookings where id = s.booking_id;

  -- Time charge = original booking amount + extra minutes proration
  v_hourly_rate := b.amount / (extract(epoch from (upper(b.during) - lower(b.during))) / 3600.0);
  v_time_charge := b.amount + round(((s.extra_minutes / 60.0) * v_hourly_rate)::numeric, 2);

  -- Food charge from served items
  select coalesce(sum(oi.qty * oi.price), 0) into v_food_charge
  from orders o
  join order_items oi on oi.order_id = o.id
  where o.session_id = p_session and o.status = 'served';

  -- Close session
  update sessions
  set ended_at = now(), time_charge = v_time_charge
  where id = p_session;

  update game_tables set status = 'free' where id = s.table_id;
  update bookings set status = 'completed' where id = b.id;

  -- Insert bill
  insert into bills(session_id, time_charge, food_charge)
  values (p_session, v_time_charge, v_food_charge)
  returning id into v_bill_id;

  insert into audit_log(actor, action, entity, entity_id, meta)
  values (auth.uid(), 'session.end', 'bill', v_bill_id::text,
    jsonb_build_object('time_charge', v_time_charge, 'food_charge', v_food_charge));

  return v_bill_id;
end $$;

-- 6. Mark bill as paid
create or replace function mark_paid(p_bill uuid, p_pay_mode pay_mode)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role in ('staff', 'owner')) then
    raise exception 'FORBIDDEN';
  end if;

  update bills
  set paid = true, pay_mode = p_pay_mode, paid_at = now()
  where id = p_bill;

  insert into audit_log(actor, action, entity, entity_id, meta)
  values (auth.uid(), 'bill.paid', 'bill', p_bill::text, jsonb_build_object('mode', p_pay_mode));
end $$;

-- 7. Trigger to automatically provision profile when user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();
