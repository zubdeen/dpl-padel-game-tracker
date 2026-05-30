ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS team1_name text,
  ADD COLUMN IF NOT EXISTS team2_name text;

UPDATE public.matches m
SET
  team1_name = COALESCE(
    m.team1_name,
    (SELECT p.team FROM public.players p WHERE p.id = m.team1_player1_id)
  ),
  team2_name = COALESCE(
    m.team2_name,
    (SELECT p.team FROM public.players p WHERE p.id = m.team2_player1_id)
  )
WHERE m.team1_name IS NULL
   OR m.team2_name IS NULL;

NOTIFY pgrst, 'reload schema';
