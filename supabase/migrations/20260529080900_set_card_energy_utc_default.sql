-- Migration: 20260529080900_set_card_energy_utc_default.sql
-- Ensure `last_reset_at` uses UTC date by default and normalize existing rows.

ALTER TABLE public.card_energy
  ALTER COLUMN last_reset_at SET DEFAULT (timezone('UTC', now())::date);

-- Update any NULL last_reset_at rows to today's UTC date (safe normalization)
UPDATE public.card_energy
SET last_reset_at = timezone('UTC', now())::date
WHERE last_reset_at IS NULL;
