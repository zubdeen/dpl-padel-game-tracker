import { Trophy } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { computeTeamStandings, type Match, type Player } from "@/lib/scoring";

interface Props {
  players: Player[];
  matches: Match[];
}

export function StandingsSection({ players, matches }: Props) {
  const standings = computeTeamStandings(players, matches);

  return (
    <SectionCard
      title="Team Standings"
      icon={<Trophy className="h-3.5 w-3.5 text-primary/70" />}
    >
      <div className="space-y-1">
        <div className="flex items-center px-2 py-2 text-[7px] uppercase tracking-widest text-muted-foreground font-medium border-b border-white/[0.04]">
          <span className="w-5 text-center">#</span>
          <span className="flex-1 pl-1">Pair</span>
          <span className="w-6 text-center">MP</span>
          <span className="w-6 text-center">W</span>
          <span className="w-6 text-center">L</span>
          <span className="w-8 text-right">PTS</span>
        </div>

        {standings.length === 0 && (
          <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">
            No matches recorded yet.
          </p>
        )}

        {standings.map((team, index) => {
          const rank = index + 1;
          return (
            <div
              key={team.key}
              className={`flex items-center rounded-lg px-2 py-2 transition-all duration-150 ${
                rank === 1
                  ? "bg-gradient-to-r from-primary/10 to-transparent ring-1 ring-primary/20"
                  : "bg-white/[0.02] ring-1 ring-white/[0.04]"
              }`}
            >
              <span
                className={`w-5 text-center text-[11px] font-bold ${
                  rank === 1 ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {rank}
              </span>
              <span className="flex-1 pl-1 text-[11px] font-medium text-foreground/90 truncate">
                {team.players[0].name} &amp; {team.players[1].name}
              </span>
              <span className="w-6 text-center text-[10px] text-muted-foreground tabular-nums">
                {team.matches}
              </span>
              <span className="w-6 text-center text-[10px] text-emerald-400/80 font-medium tabular-nums">
                {team.wins}
              </span>
              <span className="w-6 text-center text-[10px] text-red-400/70 font-medium tabular-nums">
                {team.losses}
              </span>
              <span
                className={`w-8 text-right text-[12px] font-bold tabular-nums ${
                  rank === 1 ? "text-primary" : "text-foreground"
                }`}
              >
                {team.totalDelta > 0 ? "+" : ""}
                {team.totalDelta}
              </span>
            </div>
          );
        })}

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-3 text-[7px] text-muted-foreground/60">
          <span>MP: Matches</span>
          <span>W: Wins</span>
          <span>L: Losses</span>
          <span>PTS: Game Difference</span>
        </div>
      </div>
    </SectionCard>
  );
}
