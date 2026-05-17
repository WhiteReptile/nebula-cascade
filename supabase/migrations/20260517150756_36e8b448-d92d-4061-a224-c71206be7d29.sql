-- Backfill rolling 24h energy reset window on card_energy
UPDATE public.card_energy
SET next_reset_at = now() + interval '24 hours'
WHERE next_reset_at IS NULL;