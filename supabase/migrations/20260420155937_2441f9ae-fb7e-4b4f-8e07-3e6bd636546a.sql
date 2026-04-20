-- 1. Wallet uniqueness (case-insensitive, only when set)
CREATE UNIQUE INDEX IF NOT EXISTS players_wallet_address_unique
  ON public.players (LOWER(wallet_address))
  WHERE wallet_address IS NOT NULL;

-- 2. Main card designation (separate from active_card_id)
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS main_card_id UUID;

-- 3. Anti-flip lock on cards
ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS sale_lock_until TIMESTAMPTZ;

-- 4. Rolling 24h energy reset
ALTER TABLE public.card_energy
  ADD COLUMN IF NOT EXISTS next_reset_at TIMESTAMPTZ;

-- 5. ERC-1155 readiness
ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS contract_standard TEXT NOT NULL DEFAULT 'erc1155';
ALTER TABLE public.cards
  ADD COLUMN IF NOT EXISTS max_supply INTEGER;

-- 6. Updated holding-limit trigger: 10 total + 2 per token_id
CREATE OR REPLACE FUNCTION public.enforce_max_cards_per_player()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.owner_player_id IS NOT NULL THEN
    -- Total cap: 10
    IF (
      SELECT COUNT(*) FROM public.cards
      WHERE owner_player_id = NEW.owner_player_id
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) >= 10 THEN
      RAISE EXCEPTION 'A player cannot own more than 10 cards';
    END IF;

    -- Per-token cap: 2 copies of any single token_id
    IF (
      SELECT COUNT(*) FROM public.cards
      WHERE owner_player_id = NEW.owner_player_id
        AND token_id = NEW.token_id
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) >= 2 THEN
      RAISE EXCEPTION 'A player cannot hold more than 2 copies of the same NFT (token_id %)', NEW.token_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Re-attach trigger if missing (safe to recreate)
DROP TRIGGER IF EXISTS enforce_max_cards_per_player_trigger ON public.cards;
CREATE TRIGGER enforce_max_cards_per_player_trigger
  BEFORE INSERT OR UPDATE OF owner_player_id, token_id ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_max_cards_per_player();