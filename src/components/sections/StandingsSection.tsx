import { Trophy } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { computeTeamStandings, type Match, type Player } from "@/lib/scoring";
import { TEAM_RANKING_STATUS_LABELS, type TeamRanking } from "@/lib/team-rankings";
import { dplLogo, teamLogos } from "@/lib/team-logos";
import { memo, useMemo, useState } from "react";

interface Props {
  players: Player[];
  matches: Match[];
  teamRankings: TeamRanking[];
}

export const StandingsSection = memo(function StandingsSectionComponent({
  players,
  matches,
  teamRankings,
}: Props) {
  const standings = useMemo(() => computeTeamStandings(players, matches), [players, matches]);
  const [activeRanking, setActiveRanking] = useState<"league" | "overall">("overall");

  return (
    <div className="space-y-6">
      {/* League header card */}
      <SectionCard title="League Overview">
        <div className="flex flex-col items-center text-center">
          {/* DPL Logo */}
          <div className="w-28 h-28 mb-4">
            <img
              src={dplLogo}
              alt="Diamond Padel League"
              loading="lazy"
              decoding="async"
              className="object-contain w-full h-full"
            />
          </div>

          {/* Main title */}
          <h1 className="text-2xl font-bold tracking-tight leading-none text-foreground">
            <span className="text-primary">Diamond</span> Padel League
          </h1>

          {/* Season badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-primary/10 border border-primary/20">
            <Trophy className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary uppercase tracking-[0.18em]">
              Season 4
            </span>
          </div>

          {/* Tagline */}
          <p className="mt-4 text-muted-foreground text-[11px] leading-relaxed max-w-[250px]">
            Gaborone&apos;s premier padel league. Where champions are forged.
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-2 my-5 w-full">
            <div className="h-px flex-1 max-w-[70px] bg-gradient-to-r from-transparent to-primary/40" />
            <div className="h-1.5 w-1.5 rotate-45 bg-primary/50 rounded-[1px]" />
            <div className="h-px flex-1 max-w-[70px] bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 w-full pt-1">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground leading-none">42</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Players
              </p>
            </div>

            <div className="h-6 w-px bg-primary/15" />

            <div className="text-center">
              <p className="text-lg font-bold text-primary leading-none">6</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Teams
              </p>
            </div>

            <div className="h-6 w-px bg-primary/15" />

            <div className="text-center">
              <p className="text-lg font-bold text-foreground leading-none">8</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                Match Nights
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Team Standings" icon={<Trophy className="h-3.5 w-3.5 text-primary/70" />}>
        <div className="space-y-1">
          <div className="flex gap-1 p-1 mb-4 bg-zinc-900/50 rounded-xl ring-1 ring-white/[0.04]">
            {(["league", "overall"] as const).map((ranking) => (
              <button
                key={ranking}
                type="button"
                onClick={() => setActiveRanking(ranking)}
                className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all duration-150 ${
                  activeRanking === ranking
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                {ranking === "league" ? "League Phase" : "Championship Ranking"}
              </button>
            ))}
          </div>

          {activeRanking === "league" ? (
            <LeagueStandings standings={standings} />
          ) : (
            <OverallRankings rankings={teamRankings} />
          )}
        </div>
      </SectionCard>
    </div>
  );
});

function LeagueStandings({ standings }: { standings: ReturnType<typeof computeTeamStandings> }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center px-2 py-2 text-[7px] uppercase tracking-widest text-muted-foreground font-medium border-b border-white/[0.04]">
        <span className="w-5 text-center">#</span>
        <span className="flex-1 pl-1">Team</span>
        <span className="w-6 text-center">MP</span>
        <span className="w-6 text-center">W</span>
        <span className="w-6 text-center">L</span>
        <span className="w-8 text-right">PTS</span>
      </div>

      {standings.length === 0 && (
        <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">No teams yet.</p>
      )}

      {standings.map((team, index) => {
        const rank = index + 1;
        return (
          <div
            key={team.team}
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
            <div className="flex items-center gap-2 flex-1 pl-1 min-w-0">
              <img
                src={teamLogos[team.team]}
                alt={team.team}
                className="w-5 h-5 object-contain flex-shrink-0"
                loading="lazy"
              />

              <span className="text-[11px] font-semibold text-foreground/90 truncate tracking-wide">
                {team.team}
              </span>
            </div>
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
              {team.points}
            </span>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-3 text-[7px] text-muted-foreground/60">
        <span>Win 3 · 6-0 win 4 · Tiebreak 2/1</span>
      </div>
    </div>
  );
}

function OverallRankings({ rankings }: { rankings: TeamRanking[] }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center px-2 py-2 text-[7px] uppercase tracking-widest text-muted-foreground font-medium border-b border-white/[0.04]">
        <span className="w-8 text-center">#</span>
        <span className="flex-1 pl-2">Team</span>
      </div>
      {rankings.length === 0 && (
        <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">
          No overall ranking has been published yet.
        </p>
      )}
      {rankings.map((ranking) => {
        const isEliminationStatus =
          ranking.status === "playing_e1" ||
          ranking.status === "playing_e2" ||
          ranking.status === "eliminated";
        return (
          <div
            key={ranking.team}
            className={`flex items-center rounded-lg px-2 py-2.5 ${ranking.position === 1 ? "bg-gradient-to-r from-primary/10 to-transparent ring-1 ring-primary/20" : "bg-white/[0.02] ring-1 ring-white/[0.04]"}`}
          >
            <span
              className={`w-8 text-center text-[12px] font-bold ${ranking.position === 1 ? "text-primary" : "text-muted-foreground"}`}
            >
              {ranking.position}
            </span>
            <div className="flex items-center gap-2 flex-1 pl-2 min-w-0">
              <img
                src={teamLogos[ranking.team]}
                alt={ranking.team}
                className="w-6 h-6 object-contain flex-shrink-0"
                loading="lazy"
              />
              <div className="min-w-0">
                <span className="block text-[11px] font-semibold text-foreground/90 truncate tracking-wide">
                  {ranking.team}
                </span>
                {ranking.status && (
                  <span
                    className={`block mt-0.5 text-[8px] font-bold uppercase tracking-wider ${isEliminationStatus ? "text-red-400" : "text-yellow-300"}`}
                  >
                    {TEAM_RANKING_STATUS_LABELS[ranking.status]}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
