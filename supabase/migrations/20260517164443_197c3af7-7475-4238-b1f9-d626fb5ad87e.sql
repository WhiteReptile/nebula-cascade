
-- 1. has_ever_owned_card flag on players
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS has_ever_owned_card boolean NOT NULL DEFAULT false;

UPDATE public.players p
  SET has_ever_owned_card = true
  WHERE EXISTS (SELECT 1 FROM public.cards c WHERE c.owner_player_id = p.id);

CREATE OR REPLACE FUNCTION public.mark_player_owned_card()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.owner_player_id IS NOT NULL THEN
    UPDATE public.players
      SET has_ever_owned_card = true
      WHERE id = NEW.owner_player_id
        AND has_ever_owned_card = false;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_mark_player_owned_card ON public.cards;
CREATE TRIGGER trg_mark_player_owned_card
  AFTER INSERT OR UPDATE OF owner_player_id ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.mark_player_owned_card();

-- 2. guest_scores table
CREATE TABLE IF NOT EXISTS public.guest_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text NOT NULL,
  device_id text NOT NULL,
  score bigint NOT NULL,
  level_reached integer NOT NULL DEFAULT 1,
  survival_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  CONSTRAINT guest_scores_min_score CHECK (score >= 2000),
  CONSTRAINT guest_scores_nickname_len CHECK (char_length(nickname) BETWEEN 3 AND 16),
  UNIQUE (device_id, nickname)
);

CREATE INDEX IF NOT EXISTS guest_scores_score_idx ON public.guest_scores (score DESC);
CREATE INDEX IF NOT EXISTS guest_scores_expires_idx ON public.guest_scores (expires_at);

ALTER TABLE public.guest_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Guest scores viewable by everyone" ON public.guest_scores;
CREATE POLICY "Guest scores viewable by everyone"
  ON public.guest_scores FOR SELECT
  USING (true);
-- No INSERT/UPDATE/DELETE policies => only service role (edge function) can write.

-- 3. Purge cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.purge_expired_guest_scores()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.guest_scores WHERE expires_at < now();
$$;

DO $$
BEGIN
  PERFORM cron.unschedule('purge-guest-scores');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'purge-guest-scores',
  '*/15 * * * *',
  $$ SELECT public.purge_expired_guest_scores(); $$
);
