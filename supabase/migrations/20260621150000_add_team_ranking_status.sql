ALTER TABLE public.team_rankings
  ADD COLUMN status TEXT;

ALTER TABLE public.team_rankings
  ADD CONSTRAINT team_rankings_status_check
  CHECK (
    status IS NULL OR status IN (
      'to_semifinal',
      'to_final',
      'up_for_elimination',
      'eliminated'
    )
  );
