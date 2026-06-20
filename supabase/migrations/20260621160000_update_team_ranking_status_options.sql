ALTER TABLE public.team_rankings
  DROP CONSTRAINT team_rankings_status_check;

UPDATE public.team_rankings
SET status = NULL
WHERE status IS NOT NULL
  AND status NOT IN ('qualified_s1', 'qualified_s2', 'playing_e1', 'playing_e2');

ALTER TABLE public.team_rankings
  ADD CONSTRAINT team_rankings_status_check
  CHECK (
    status IS NULL OR status IN (
      'qualified_s1',
      'qualified_s2',
      'playing_e1',
      'playing_e2'
    )
  );
