-- 0003_booked_slots_sync.sql

create table if not exists booked_slots (
  booking_id uuid primary key references bookings(id) on delete cascade,
  table_id   uuid not null references game_tables(id),
  during     tstzrange not null
);

create index if not exists booked_slots_during_gist_idx on booked_slots using gist (table_id, during);

create or replace function sync_booked_slots()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'DELETE') then
    delete from booked_slots where booking_id = old.id;
    return old;
  end if;

  if (new.status in ('confirmed', 'checked_in')) then
    insert into booked_slots(booking_id, table_id, during)
    values (new.id, new.table_id, new.during)
    on conflict (booking_id) do update set
      table_id = excluded.table_id,
      during = excluded.during;
  else
    -- cancelled / completed / no_show frees the slot live
    delete from booked_slots where booking_id = new.id;
  end if;

  return new;
end $$;

drop trigger if exists trg_sync_booked_slots on bookings;
create trigger trg_sync_booked_slots
after insert or update or delete on bookings
for each row execute function sync_booked_slots();

-- Add tables to realtime publication if publication exists
do $$ begin
  alter publication supabase_realtime add table booked_slots, game_tables, sessions, orders;
exception when others then null; end $$;
