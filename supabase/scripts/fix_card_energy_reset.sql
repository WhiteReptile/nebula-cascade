-- Script: fix_card_energy_reset.sql
-- Run this in the Supabase SQL editor to set the default to UTC date
-- and optionally normalize existing rows. Review and run in staging first.

-- 1) Set default to UTC date
ALTER TABLE public.card_energy
  ALTER COLUMN last_reset_at SET DEFAULT (timezone('UTC', now())::date);

-- 2) Normalize rows where last_reset_at is NULL
UPDATE public.card_energy
SET last_reset_at = timezone('UTC', now())::date
WHERE last_reset_at IS NULL;

-- Optional: If you want to force-normalize rows whose date is off by timezone
-- (careful: this changes history). Example: shift dates by 1 day when they
-- are greater than today's UTC date (possible if server timezone was non-UTC):
-- UPDATE public.card_energy
-- SET last_reset_at = timezone('UTC', now())::date
-- WHERE last_reset_at > timezone('UTC', now())::date;
