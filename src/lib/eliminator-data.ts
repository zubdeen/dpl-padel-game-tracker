import { supabase } from "@/integrations/supabase/client";
import type { EliminatorMatch } from "@/lib/eliminators";

const eliminatorSelect =
  "id, team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id, team1_games, team2_games, played_at";

export async function fetchEliminatorMatches(): Promise<EliminatorMatch[]> {
  const { data, error } = await supabase
    .from("eliminator_matches")
    .select(eliminatorSelect)
    .order("played_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as EliminatorMatch[];
}
