
-- 1. Rename gems → cards
ALTER TABLE public.gems RENAME TO cards;

-- 2. Add new columns to cards
ALTER TABLE public.cards
  ADD COLUMN image_url text,
  ADD COLUMN flavor_text text NOT NULL DEFAULT '',
  ADD COLUMN price_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN is_active boolean NOT NULL DEFAULT false;

-- 3. Drop old RLS policies on cards (they reference old name internally)
DROP POLICY IF EXISTS "Admins can manage gems" ON public.cards;
DROP POLICY IF EXISTS "Gems are viewable by everyone" ON public.cards;

-- 4. Recreate RLS policies for cards
CREATE POLICY "Cards are viewable by everyone"
  ON public.cards FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage cards"
  ON public.cards FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. Add active_card_id to players
ALTER TABLE public.players
  ADD COLUMN active_card_id uuid;

-- 6. Create card_energy table
CREATE TABLE public.card_energy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL UNIQUE REFERENCES public.cards(id) ON DELETE CASCADE,
  energy integer NOT NULL DEFAULT 2,
  max_energy integer NOT NULL DEFAULT 2,
  last_reset_at date NOT NULL DEFAULT CURRENT_DATE
);

ALTER TABLE public.card_energy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Card owners can view own card energy"
  ON public.card_energy FOR SELECT
  TO authenticated
  USING (
    card_id IN (
      SELECT c.id FROM public.cards c
      JOIN public.players p ON p.id = c.owner_player_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Card owners can update own card energy"
  ON public.card_energy FOR UPDATE
  TO authenticated
  USING (
    card_id IN (
      SELECT c.id FROM public.cards c
      JOIN public.players p ON p.id = c.owner_player_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Card owners can insert own card energy"
  ON public.card_energy FOR INSERT
  TO authenticated
  WITH CHECK (
    card_id IN (
      SELECT c.id FROM public.cards c
      JOIN public.players p ON p.id = c.owner_player_id
      WHERE p.user_id = auth.uid()
    )
  );

-- 7. Create marketplace_listings table
CREATE TABLE public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  seller_player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  price_cents integer NOT NULL,
  fee_percent real NOT NULL DEFAULT 5,
  listed_at timestamptz NOT NULL DEFAULT now(),
  sold_at timestamptz,
  buyer_player_id uuid REFERENCES public.players(id),
  status text NOT NULL DEFAULT 'active'
);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active listings"
  ON public.marketplace_listings FOR SELECT
  TO public
  USING (status = 'active');

CREATE POLICY "Sellers can view own listings"
  ON public.marketplace_listings FOR SELECT
  TO authenticated
  USING (
    seller_player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can insert own listings"
  ON public.marketplace_listings FOR INSERT
  TO authenticated
  WITH CHECK (
    seller_player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update own listings"
  ON public.marketplace_listings FOR UPDATE
  TO authenticated
  USING (
    seller_player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all listings"
  ON public.marketplace_listings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 8. Create game_sessions table
CREATE TABLE public.game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  card_id uuid REFERENCES public.cards(id),
  seed text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed boolean NOT NULL DEFAULT false,
  cooldown_until timestamptz
);

ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own sessions"
  ON public.game_sessions FOR SELECT
  TO authenticated
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Players can insert own sessions"
  ON public.game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Players can update own sessions"
  ON public.game_sessions FOR UPDATE
  TO authenticated
  USING (
    player_id IN (
      SELECT id FROM public.players WHERE user_id = auth.uid()
    )
  );

-- 9. Add columns to match_logs
ALTER TABLE public.match_logs
  ADD COLUMN card_id uuid,
  ADD COLUMN session_seed text,
  ADD COLUMN session_id uuid;

-- 10. Add avg_top3_score to leaderboard
ALTER TABLE public.leaderboard
  ADD COLUMN avg_top3_score bigint NOT NULL DEFAULT 0;

-- 11. Add columns to reward_periods
ALTER TABLE public.reward_periods
  ADD COLUMN starts_at timestamptz,
  ADD COLUMN ends_at timestamptz,
  ADD COLUMN freeze_ends_at timestamptz,
  ADD COLUMN payout_at timestamptz;

-- 12. Add new enum values to reward_period_status
ALTER TYPE public.reward_period_status ADD VALUE IF NOT EXISTS 'frozen';
ALTER TYPE public.reward_period_status ADD VALUE IF NOT EXISTS 'pending_payout';
ALTER TYPE public.reward_period_status ADD VALUE IF NOT EXISTS 'paid';

-- 13. Trigger: max 10 cards per player
CREATE OR REPLACE FUNCTION public.enforce_max_cards_per_player()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_player_id IS NOT NULL THEN
    IF (
      SELECT COUNT(*) FROM public.cards
      WHERE owner_player_id = NEW.owner_player_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) >= 10 THEN
      RAISE EXCEPTION 'A player cannot own more than 10 cards';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_max_cards
  BEFORE INSERT OR UPDATE ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_max_cards_per_player();

-- 14. Indexes
CREATE INDEX idx_card_energy_card_id ON public.card_energy(card_id);
CREATE INDEX idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX idx_game_sessions_player_completed ON public.game_sessions(player_id, completed);
