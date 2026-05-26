import { Swords } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import type { Match, Player } from "@/lib/scoring";

interface Props {
  players: Player[];
  matches: Match[];
}

export function FixturesSection({ players, matches }: Props) {
  const nameById = new Map(players.map((p) => [p.id, p.name]));

  return (
    <SectionCard
      title="Match History"
      icon={<Swords className="h-3.5 w-3.5 text-primary/70" />}
    >
      <div className="space-y-2">
        {matches.length === 0 && (
          <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">
            No matches recorded yet.
          </p>
        )}

        {matches.map((m) => {
          const t1Win = m.team1_games > m.team2_games;
          return (
            <div
              key={m.id}
              className="rounded-xl p-3 bg-white/[0.02] ring-1 ring-white/[0.04]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  {new Date(m.played_at).toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-primary/70">
                  Final
                </span>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div
                  className={`text-right text-[12px] ${
                    t1Win ? "font-bold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {nameById.get(m.team1_player1_id) ?? "?"}
                  <br />
                  {nameById.get(m.team1_player2_id) ?? "?"}
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 ring-1 ring-white/5">
                  <span
                    className={`text-base font-bold tabular-nums ${
                      t1Win ? "text-primary" : "text-foreground/70"
                    }`}
                  >
                    {m.team1_games}
                  </span>
                  <span className="text-muted-foreground text-xs">–</span>
                  <span
                    className={`text-base font-bold tabular-nums ${
                      !t1Win ? "text-primary" : "text-foreground/70"
                    }`}
                  >
                    {m.team2_games}
                  </span>
                </div>

                <div
                  className={`text-left text-[12px] ${
                    !t1Win
                      ? "font-bold text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {nameById.get(m.team2_player1_id) ?? "?"}
                  <br />
                  {nameById.get(m.team2_player2_id) ?? "?"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
