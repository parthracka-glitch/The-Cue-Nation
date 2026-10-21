-- 0002_core_tables.sql

create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 80),
  email       text not null,
  phone       text check (phone is null or phone ~ '^\+?[0-9]{10,13}$'),
  role        user_role not null default 'customer',
  created_at  timestamptz not null default now()
);

create table if not exists game_tables (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  type        table_type not null,
  status      table_status not null default 'free',
  qr_secret   text not null default encode(gen_random_bytes(16),'hex'),
  active      boolean not null default true
);

create table if not exists pricing (
  id            uuid primary key default gen_random_uuid(),
  table_type    table_type not null,
  label         text not null,
  days          int[] not null,
  start_time    time not null,
  end_time      time not null,
  price_per_hour numeric(8,2) not null check (price_per_hour >= 0)
);

create table if not exists bookings (
  id            uuid primary key default gen_random_uuid(),
  booking_code  text not null unique,
  user_id       uuid references profiles(id),
  guest_name    text,
  guest_phone   text,
  table_id      uuid not null references game_tables(id),
  during        tstzrange not null,
  status        booking_status not null default 'confirmed',
  source        booking_source not null default 'online',
  pin_hash      text not null,
  pin_attempts  int not null default 0,
  amount        numeric(10,2) not null check (amount >= 0),
  created_at    timestamptz not null default now(),
  constraint no_overlap exclude using gist
    (table_id with =, during with &&)
    where (status in ('confirmed','checked_in'))
);

create index if not exists bookings_user_id_idx on bookings (user_id);
create index if not exists bookings_during_gist_idx on bookings using gist (during);

create table if not exists sessions (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid not null unique references bookings(id),
  table_id      uuid not null references game_tables(id),
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  extra_minutes int not null default 0 check (extra_minutes >= 0),
  time_charge   numeric(10,2) not null default 0
);

create unique index if not exists one_running_session_per_table on sessions(table_id) where ended_at is null;

create table if not exists menu_items (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null,
  price       numeric(8,2) not null check (price >= 0),
  available   boolean not null default true,
  image_url   text
);

create table if not exists orders (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id),
  table_id    uuid not null references game_tables(id),
  status      order_status not null default 'new',
  created_at  timestamptz not null default now()
);

create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  menu_item_id uuid not null references menu_items(id),
  qty          int not null check (qty between 1 and 20),
  price        numeric(8,2) not null
);

create table if not exists bills (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null unique references sessions(id),
  time_charge numeric(10,2) not null,
  food_charge numeric(10,2) not null default 0,
  total       numeric(10,2) generated always as (time_charge + food_charge) stored,
  paid        boolean not null default false,
  pay_mode    pay_mode,
  paid_at     timestamptz
);

create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  amount      numeric(10,2) not null check (amount > 0),
  spent_on    date not null,
  note        text,
  created_by  uuid references profiles(id)
);

create table if not exists site_content (
  key         text primary key,
  value       jsonb not null,
  updated_by  uuid references profiles(id),
  updated_at  timestamptz not null default now()
);

create table if not exists audit_log (
  id          bigserial primary key,
  actor       uuid,
  action      text not null,
  entity      text not null,
  entity_id   text,
  meta        jsonb,
  at          timestamptz not null default now()
);
