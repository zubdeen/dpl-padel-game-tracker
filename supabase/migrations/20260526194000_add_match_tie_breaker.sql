-- Add explicit tie breaker support for match scoring.
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS tie_breaker BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS team text,
  ADD COLUMN IF NOT EXISTS ranking numeric;

CREATE INDEX IF NOT EXISTS players_team_idx ON public.players (team);
CREATE INDEX IF NOT EXISTS players_ranking_idx ON public.players (ranking);
