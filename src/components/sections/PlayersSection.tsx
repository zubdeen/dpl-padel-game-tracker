import { Users, Crown } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { computePlayerStandings, type Match, type Player } from "@/lib/scoring";

interface Props {
  players: Player[];
  matches: Match[];
}

function getInitials(name: string): string {
  const parts = name.split(/[\s.]+/);
  if (parts.length === 1) return name.substring(0, 2).toUpperCase();
  return parts.map((p) => p[0]).join("").toUpperCase().substring(0, 2);
}

export function PlayersSection({ players, matches }: Props) {
  const standings = computePlayerStandings(players, matches);

  return (
    <SectionCard
      title="Player Rankings"
      icon={<Users className="h-3.5 w-3.5 text-primary/70" />}
    >
      <div className="space-y-1.5">
        {standings.length === 0 && (
          <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">
            No players added yet.
          </p>
        )}

        {standings.map((s, i) => {
          const rank = i + 1;
          const isLeader = rank === 1 && s.matches > 0;
          return (
            <div
              key={s.player.id}
              className={`flex items-center gap-3 rounded-xl p-2.5 transition-all duration-150 ${
                isLeader
                  ? "bg-gradient-to-r from-primary/10 to-transparent ring-1 ring-primary/20"
                  : "bg-white/[0.02] ring-1 ring-white/[0.04]"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  isLeader
                    ? "bg-primary/20 text-primary"
                    : "bg-zinc-800/70 text-muted-foreground"
                }`}
              >
                {isLeader ? (
                  <Crown className="h-3.5 w-3.5" />
                ) : (
                  <span className="text-[10px] font-bold">{rank}</span>
                )}
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 ring-1 ring-white/10">
                <span className="text-[10px] font-medium text-foreground">
                  {getInitials(s.player.name)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-[13px] truncate">
                  {s.player.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {s.matches} matches · {s.wins}W–{s.losses}L
                </p>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span className="text-[9px] uppercase text-muted-foreground">
                    Avg
                  </span>
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      s.average > 0
                        ? "text-emerald-400"
                        : s.average < 0
                        ? "text-red-400"
                        : "text-foreground"
                    }`}
                  >
                    {s.matches > 0
                      ? `${s.average > 0 ? "+" : ""}${s.average.toFixed(2)}`
                      : "—"}
                  </span>
                </div>
                <span className="text-[9px] text-muted-foreground tabular-nums">
                  total {s.totalDelta > 0 ? "+" : ""}
                  {s.totalDelta}
                </span>
              </div>
            </div>
          );
        })}

        <p className="text-center text-[9px] text-muted-foreground/60 pt-2">
          Avg = sum of game differences ÷ matches played
        </p>
      </div>
    </SectionCard>
  );
}
