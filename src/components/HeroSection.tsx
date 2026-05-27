import { Trophy } from "lucide-react";

interface HeroSectionProps {
  playerCount: number;
  matchCount: number;
}

export function HeroSection({ playerCount, matchCount }: HeroSectionProps) {
  return (
    <section className="py-5 text-center">
      {/* Logo placeholder — diamond emblem */}
      <div className="flex justify-center mb-4">
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent ring-1 ring-primary/30 flex items-center justify-center">
          <div className="h-10 w-10 rotate-45 bg-gradient-to-br from-primary to-primary/60 rounded" />
        </div>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
        <span className="text-primary">Diamond</span> Padel League
      </h1>

      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mt-2 mb-3 rounded-full bg-primary/10 border border-primary/20">
        <Trophy className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">
          Live Rankings
        </span>
      </div>

      <p className="text-muted-foreground text-[11px] max-w-[240px] mx-auto leading-relaxed mb-5">
        Where every match shapes the leaderboard.
      </p>

      <div className="flex items-center justify-center gap-1.5 mb-5">
        <div className="h-px w-10 bg-gradient-to-r from-transparent via-primary/30 to-primary/50" />
        <div className="h-1 w-1 rotate-45 bg-primary/50" />
        <div className="h-px w-10 bg-gradient-to-l from-transparent via-primary/30 to-primary/50" />
      </div>

      <div className="flex items-center justify-center gap-6 pt-4 border-t border-border/20">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground tabular-nums">
            {playerCount}
          </p>
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Players
          </p>
        </div>
        <div className="h-5 w-px bg-primary/15" />
        <div className="text-center">
          <p className="text-lg font-bold text-primary tabular-nums">
            {matchCount}
          </p>
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Matches
          </p>
        </div>
      </div>
    </section>
  );
}
