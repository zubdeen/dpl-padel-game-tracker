CREATE TABLE public.team_rankings (
  team TEXT PRIMARY KEY,
  position INTEGER NOT NULL CHECK (position > 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO public.team_rankings (team, position) VALUES
  ('ACE DEUCE', 1),
  ('LOS TOROS', 2),
  ('SMASH BROS GC', 3),
  ('SMASH MASTERS', 4),
  ('TOKOLOSHE', 5),
  ('VIBORA RAPTORS', 6);

GRANT SELECT ON public.team_rankings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_rankings TO authenticated;
GRANT ALL ON public.team_rankings TO service_role;

ALTER TABLE public.team_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team rankings" ON public.team_rankings
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert team rankings" ON public.team_rankings
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update team rankings" ON public.team_rankings
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete team rankings" ON public.team_rankings
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
