import { supabase } from "@/integrations/supabase/client";

export type TeamRankingStatus =
  | "qualified_s1"
  | "qualified_s2"
  | "playing_e1"
  | "playing_e2"
  | "eliminated";

export type TeamRanking = {
  team: string;
  position: number;
  status: TeamRankingStatus | null;
};

export const TEAM_RANKING_STATUS_LABELS: Record<TeamRankingStatus, string> = {
  qualified_s1: "Qualified to S1",
  qualified_s2: "Qualified to S2",
  playing_e1: "Playing in E1",
  playing_e2: "Playing in E2",
  eliminated: "Eliminated",
};

export async function fetchTeamRankings(): Promise<TeamRanking[]> {
  const { data, error } = await supabase
    .from("team_rankings")
    .select("team, position, status")
    .order("position", { ascending: true });

  if (error) throw error;
  return (data ?? []) as TeamRanking[];
}
