-- Add price_wei field for on-chain listing price tracking (dual-currency support)
-- Marketplace shows USD (price_cents) to users, but contract uses Wei (price_wei)

ALTER TABLE public.marketplace_listings
  ADD COLUMN IF NOT EXISTS price_wei text;

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_price_wei
  ON public.marketplace_listings (price_wei);
