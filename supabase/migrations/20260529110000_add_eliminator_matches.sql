CREATE TABLE IF NOT EXISTS public.eliminator_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team1_player1_id UUID NOT NULL REFERENCES public.players(id) ON DELETE RESTRICT,
  team1_player2_id UUID NOT NULL REFERENCES public.players(id) ON DELETE RESTRICT,
  team2_player1_id UUID NOT NULL REFERENCES public.players(id) ON DELETE RESTRICT,
  team2_player2_id UUID NOT NULL REFERENCES public.players(id) ON DELETE RESTRICT,
  team1_games INTEGER NOT NULL CHECK (team1_games >= 0),
  team2_games INTEGER NOT NULL CHECK (team2_games >= 0),
  played_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID DEFAULT auth.uid()
);

ALTER TABLE public.eliminator_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view eliminator matches"
ON public.eliminator_matches FOR SELECT
USING (true);

CREATE POLICY "Admins can insert eliminator matches"
ON public.eliminator_matches FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update eliminator matches"
ON public.eliminator_matches FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete eliminator matches"
ON public.eliminator_matches FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.eliminator_matches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.eliminator_matches TO authenticated;
GRANT ALL ON public.eliminator_matches TO service_role;

NOTIFY pgrst, 'reload schema';
