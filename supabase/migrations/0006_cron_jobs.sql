-- 0006_cron_jobs.sql

-- Only schedule if pg_cron is enabled in the database
do $$ begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    -- Auto-release no-shows 15 min after start time
    perform cron.schedule('release-no-shows', '* * * * *', $$
      update bookings set status = 'no_show'
      where status = 'confirmed' and lower(during) < now() - interval '15 minutes'
    $$);

    -- Purge expired booked_slots (keep past 1 day)
    perform cron.schedule('trim-booked-slots', '0 3 * * *', $$
      delete from booked_slots where upper(during) < now() - interval '1 day'
    $$);
  end if;
exception when others then null; end $$;
