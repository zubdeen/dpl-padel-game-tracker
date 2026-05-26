import { Shield } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { computeTeamStandings, type Match, type Player } from "@/lib/scoring";

interface Props {
  players: Player[];
  matches: Match[];
}

function getInitials(name: string): string {
  const parts = name.split(/[\s.]+/);
  if (parts.length === 1) return name.substring(0, 2).toUpperCase();
  return parts.map((p) => p[0]).join("").toUpperCase().substring(0, 2);
}

export function TeamsSection({ players, matches }: Props) {
  const teams = computeTeamStandings(players, matches);

  return (
    <SectionCard
      title="Pairs Played"
      icon={<Shield className="h-3.5 w-3.5 text-primary/70" />}
    >
      <div className="space-y-3">
        {teams.length === 0 && (
          <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">
            No pairs yet — pairs appear after their first match.
          </p>
        )}

        {teams.map((team, index) => {
          const isLeader = index === 0;
          return (
            <div
              key={team.key}
              className={`rounded-xl p-3.5 transition-all duration-150 ${
                isLeader
                  ? "bg-gradient-to-br from-primary/12 to-primary/4 ring-1 ring-primary/20"
                  : "bg-white/[0.02] ring-1 ring-white/[0.04]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col -space-y-2">
                  {team.players.map((p) => (
                    <div
                      key={p.id}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 ring-2 ring-card"
                    >
                      <span className="text-[9px] font-semibold text-foreground">
                        {getInitials(p.name)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-[13px] tracking-wide truncate">
                    {team.players[0].name} &amp; {team.players[1].name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {team.matches} matches · {team.wins}W–{team.losses}L
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className={`text-lg font-bold tabular-nums ${
                      isLeader ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {team.totalDelta > 0 ? "+" : ""}
                    {team.totalDelta}
                  </p>
                  <p className="text-[8px] uppercase tracking-wider text-muted-foreground">
                    Game Diff
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
