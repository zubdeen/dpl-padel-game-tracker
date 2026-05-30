import { supabase } from "@/integrations/supabase/client";
import type { Match } from "@/lib/scoring";

export const matchSelectWithTeamNames =
  "id, team1_name, team2_name, team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id, team1_games, team2_games, tie_breaker, played_at";

const legacyMatchSelect =
  "id, team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id, team1_games, team2_games, tie_breaker, played_at";

export function isMissingMatchTeamNameColumn(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as { code?: string; message?: string };
  const message = maybeError.message ?? "";

  return (
    maybeError.code === "PGRST204" &&
    (message.includes("team1_name") || message.includes("team2_name"))
  );
}

export function withoutMatchTeamNames<T extends Record<string, unknown>>(
  payload: T,
) {
  const { team1_name: _team1Name, team2_name: _team2Name, ...legacyPayload } =
    payload;
  return legacyPayload;
}

export async function fetchMatches(): Promise<Match[]> {
  const withTeamNames = await supabase
    .from("matches")
    .select(matchSelectWithTeamNames)
    .order("played_at", { ascending: false });

  if (!withTeamNames.error) {
    return (withTeamNames.data ?? []) as unknown as Match[];
  }

  if (!isMissingMatchTeamNameColumn(withTeamNames.error)) {
    throw withTeamNames.error;
  }

  const legacy = await supabase
    .from("matches")
    .select(legacyMatchSelect)
    .order("played_at", { ascending: false });

  if (legacy.error) throw legacy.error;
  return (legacy.data ?? []) as unknown as Match[];
}
