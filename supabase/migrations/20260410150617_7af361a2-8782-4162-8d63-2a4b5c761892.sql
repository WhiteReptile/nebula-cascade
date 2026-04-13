
-- Step 1: Rename enum values (must be done one at a time)
ALTER TYPE pearl_division RENAME VALUE 'pearl_v' TO 'gem_v';
ALTER TYPE pearl_division RENAME VALUE 'pearl_iv' TO 'gem_iv';
ALTER TYPE pearl_division RENAME VALUE 'pearl_iii' TO 'gem_iii';
ALTER TYPE pearl_division RENAME VALUE 'pearl_ii' TO 'gem_ii';
ALTER TYPE pearl_division RENAME VALUE 'pearl_i' TO 'gem_i';

-- Step 2: Rename the type itself
ALTER TYPE pearl_division RENAME TO gem_division;

-- Step 3: Update default values on existing tables
ALTER TABLE players ALTER COLUMN division SET DEFAULT 'gem_v'::gem_division;
ALTER TABLE leaderboard ALTER COLUMN division SET DEFAULT 'gem_v'::gem_division;

-- Step 4: Add wallet_address to players
ALTER TABLE players ADD COLUMN wallet_address text;

-- Step 5: Create gems table
CREATE TABLE public.gems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id integer UNIQUE NOT NULL,
  division gem_division NOT NULL,
  name text NOT NULL,
  color_hex text NOT NULL,
  owner_wallet text,
  owner_player_id uuid REFERENCES public.players(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gems are viewable by everyone"
  ON public.gems FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage gems"
  ON public.gems FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Step 6: Seed the 5 gems
INSERT INTO public.gems (token_id, division, name, color_hex, metadata) VALUES
  (1, 'gem_v',   'Ruby Gem',     '#ff3344', '{"element":"fire","tier":5}'),
  (2, 'gem_iv',  'Topaz Gem',    '#ffdd00', '{"element":"electricity","tier":4}'),
  (3, 'gem_iii', 'Sapphire Gem', '#3388ff', '{"element":"water","tier":3}'),
  (4, 'gem_ii',  'Amethyst Gem', '#aa44ff', '{"element":"arcane","tier":2}'),
  (5, 'gem_i',   'Diamond Gem',  '#66ffee', '{"element":"cosmic","tier":1}');

-- Step 7: Create player_energy table
CREATE TABLE public.player_energy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES public.players(id) NOT NULL UNIQUE,
  energy integer DEFAULT 0,
  max_energy integer DEFAULT 0,
  last_reset_at date DEFAULT CURRENT_DATE
);

ALTER TABLE public.player_energy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players can view own energy"
  ON public.player_energy FOR SELECT
  TO authenticated
  USING (player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid()));

CREATE POLICY "Players can update own energy"
  ON public.player_energy FOR UPDATE
  TO authenticated
  USING (player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid()));

CREATE POLICY "Players can insert own energy"
  ON public.player_energy FOR INSERT
  TO authenticated
  WITH CHECK (player_id IN (SELECT id FROM public.players WHERE user_id = auth.uid()));
