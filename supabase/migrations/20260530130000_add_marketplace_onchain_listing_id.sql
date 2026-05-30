-- Add on-chain listing tracking for the Nebula marketplace.
-- This allows the front-end to map Supabase listings to the deployed NebulaMarketplace contract.

ALTER TABLE public.marketplace_listings
  ADD COLUMN IF NOT EXISTS onchain_listing_id bigint;

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_onchain_listing_id
  ON public.marketplace_listings (onchain_listing_id);
