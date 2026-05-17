
-- 1. Attach existing enforce_max_cards_per_player function as a trigger
DROP TRIGGER IF EXISTS trg_enforce_max_cards_per_player ON public.cards;
CREATE TRIGGER trg_enforce_max_cards_per_player
BEFORE INSERT OR UPDATE OF owner_player_id, token_id ON public.cards
FOR EACH ROW
EXECUTE FUNCTION public.enforce_max_cards_per_player();

-- 2. Anti-flip 24h sale lock on cards
CREATE OR REPLACE FUNCTION public.enforce_card_sale_lock()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Only relevant when ownership changes
  IF TG_OP = 'UPDATE' AND (
       NEW.owner_player_id IS DISTINCT FROM OLD.owner_player_id OR
       NEW.owner_wallet    IS DISTINCT FROM OLD.owner_wallet
     ) THEN
    -- Reject transfers while still locked
    IF OLD.sale_lock_until IS NOT NULL AND OLD.sale_lock_until > now() THEN
      RAISE EXCEPTION 'Card % is sale-locked until %', OLD.id, OLD.sale_lock_until;
    END IF;
    -- Stamp a new 24h lock on the new owner
    NEW.sale_lock_until := now() + interval '24 hours';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_card_sale_lock ON public.cards;
CREATE TRIGGER trg_enforce_card_sale_lock
BEFORE UPDATE ON public.cards
FOR EACH ROW
EXECUTE FUNCTION public.enforce_card_sale_lock();

-- 3. Stamp sale lock when a new listing is created
CREATE OR REPLACE FUNCTION public.stamp_card_sale_lock_on_listing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.cards
    SET sale_lock_until = now() + interval '24 hours'
    WHERE id = NEW.card_id
      AND (sale_lock_until IS NULL OR sale_lock_until < now() + interval '24 hours');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stamp_card_sale_lock_on_listing ON public.marketplace_listings;
CREATE TRIGGER trg_stamp_card_sale_lock_on_listing
AFTER INSERT ON public.marketplace_listings
FOR EACH ROW
WHEN (NEW.status = 'active')
EXECUTE FUNCTION public.stamp_card_sale_lock_on_listing();
