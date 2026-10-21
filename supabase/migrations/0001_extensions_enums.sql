-- 0001_extensions_enums.sql
create extension if not exists btree_gist;   -- required for exclusion constraint on uuid + range
create extension if not exists pgcrypto;     -- PIN hashing, random tokens
-- pg_cron is enabled in Supabase via project dashboard or if supported:
create extension if not exists pg_cron;

do $$ begin
  create type user_role as enum ('customer','staff','owner');
exception when duplicate_object then null; end $$;

do $$ begin
  create type table_type as enum ('pool','snooker');
exception when duplicate_object then null; end $$;

do $$ begin
  create type table_status as enum ('free','booked','running','maintenance');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('confirmed','checked_in','completed','cancelled','no_show');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_source as enum ('online','offline');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('new','preparing','served','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pay_mode as enum ('cash','upi','card');
exception when duplicate_object then null; end $$;
