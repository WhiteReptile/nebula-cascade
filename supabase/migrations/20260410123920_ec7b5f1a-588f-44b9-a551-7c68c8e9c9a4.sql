-- Enums
CREATE TYPE public.pearl_division AS ENUM ('pearl_v', 'pearl_iv', 'pearl_iii', 'pearl_ii', 'pearl_i');
CREATE TYPE public.payout_method AS ENUM ('stripe', 'coinbase', 'circle', 'thirdweb');
CREATE TYPE public.reward_period_status AS ENUM ('open', 'validating', 'finalized');
CREATE TYPE public.payout_status AS ENUM ('pending', 'approved', 'exported', 'paid');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Anonymous',
  division public.pearl_division NOT NULL DEFAULT 'pearl_v',
  division_points BIGINT NOT NULL DEFAULT 0,
  total_matches INTEGER NOT NULL DEFAULT 0,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view all players" ON public.players
  FOR SELECT USING (true);
CREATE POLICY "Players can update own profile" ON public.players
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Players can insert own profile" ON public.players
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create player on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.players (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Player'));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Match logs table
CREATE TABLE public.match_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  score BIGINT NOT NULL DEFAULT 0,
  level_reached INTEGER NOT NULL DEFAULT 1,
  survival_time_seconds INTEGER NOT NULL DEFAULT 0,
  max_combo INTEGER NOT NULL DEFAULT 0,
  combo_efficiency REAL NOT NULL DEFAULT 0,
  omni_color_count INTEGER NOT NULL DEFAULT 0,
  lines_cleared INTEGER NOT NULL DEFAULT 0,
  anti_cheat_flags JSONB NOT NULL DEFAULT '{}',
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.match_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own matches" ON public.match_logs
  FOR SELECT USING (
    player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
  );
CREATE POLICY "Players can insert own matches" ON public.match_logs
  FOR INSERT WITH CHECK (
    player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
  );
CREATE POLICY "Admins can view all matches" ON public.match_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Leaderboard table
CREATE TABLE public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  division public.pearl_division NOT NULL DEFAULT 'pearl_v',
  total_score BIGINT NOT NULL DEFAULT 0,
  best_score BIGINT NOT NULL DEFAULT 0,
  matches_played INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  validated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id, period)
);
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboard is viewable by everyone" ON public.leaderboard
  FOR SELECT USING (true);
CREATE POLICY "Players can upsert own leaderboard" ON public.leaderboard
  FOR INSERT WITH CHECK (
    player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
  );
CREATE POLICY "Players can update own leaderboard" ON public.leaderboard
  FOR UPDATE USING (
    player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
  );

CREATE TRIGGER update_leaderboard_updated_at
  BEFORE UPDATE ON public.leaderboard
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Reward periods
CREATE TABLE public.reward_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period TEXT NOT NULL UNIQUE,
  status public.reward_period_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finalized_at TIMESTAMPTZ
);
ALTER TABLE public.reward_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reward periods viewable by everyone" ON public.reward_periods
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage reward periods" ON public.reward_periods
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Reward payouts
CREATE TABLE public.reward_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_period_id UUID NOT NULL REFERENCES public.reward_periods(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  division public.pearl_division NOT NULL,
  rank INTEGER NOT NULL,
  reward_amount_cents INTEGER NOT NULL DEFAULT 0,
  payout_method public.payout_method,
  status public.payout_status NOT NULL DEFAULT 'pending',
  exported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reward_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own payouts" ON public.reward_payouts
  FOR SELECT USING (
    player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid())
  );
CREATE POLICY "Admins can manage payouts" ON public.reward_payouts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_match_logs_player ON public.match_logs(player_id);
CREATE INDEX idx_match_logs_started ON public.match_logs(started_at DESC);
CREATE INDEX idx_leaderboard_period_division ON public.leaderboard(period, division);
CREATE INDEX idx_leaderboard_rank ON public.leaderboard(period, division, rank);
CREATE INDEX idx_reward_payouts_period ON public.reward_payouts(reward_period_id);