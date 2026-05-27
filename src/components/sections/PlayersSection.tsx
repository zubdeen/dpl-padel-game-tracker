import { useMemo, useState, memo } from "react";
import { Users, Crown, Search } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import {
  computePlayerStandings,
  type Match,
  type Player,
} from "@/lib/scoring";
import { teamLogos } from "@/lib/team-logos";

interface Props {
  players: Player[];
  matches: Match[];
}

const CATEGORY_ORDER = ["M1", "M2", "Star", "Core", "Dev"];

const CATEGORY_COLORS: Record<string, string> = {
  M1: "from-yellow-500/15 to-transparent ring-yellow-500/30",
  M2: "from-blue-500/15 to-transparent ring-blue-500/30",
  Star: "from-purple-500/15 to-transparent ring-purple-500/30",
  Core: "from-green-500/15 to-transparent ring-green-500/30",
  Dev: "from-orange-500/15 to-transparent ring-orange-500/30",
};

function getInitials(name: string): string {
  const parts = name.split(/[\s.]+/);

  if (parts.length === 1) {
    return name.substring(0, 2).toUpperCase();
  }

  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export const PlayersSection = memo(function PlayersSectionComponent({ players, matches }: Props) {
  const standings = computePlayerStandings(players, matches);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", label: "All" },
    { id: "M1", label: "M1" },
    { id: "M2", label: "M2" },
    { id: "Star", label: "Star" },
    { id: "Core", label: "Core" },
    { id: "Dev", label: "Dev" },
  ];

  const filteredStandings = useMemo(() => {
    return standings.filter((s) => {
      const matchesSearch =
        s.player.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.player.team ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        activeCategory === "all" ||
        s.player.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [standings, search, activeCategory]);

  // Group filtered standings by category
  const grouped = new Map<string, typeof standings>();

  for (const s of filteredStandings) {
    const cat = s.player.category ?? "Dev";

    if (!grouped.has(cat)) grouped.set(cat, []);

    grouped.get(cat)!.push(s);
  }

  const sortedGroups = Array.from(grouped.entries()).sort(
    (a, b) =>
      CATEGORY_ORDER.indexOf(a[0]) -
      CATEGORY_ORDER.indexOf(b[0])
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search players or teams..."
          className="w-full h-10 rounded-xl bg-zinc-900/50 border-0 ring-1 ring-white/[0.06] pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Category Filters */}
      <div className="flex gap-1 p-1 rounded-xl bg-zinc-900/50 ring-1 ring-white/[0.04] overflow-x-auto scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex-1 min-w-[52px] py-2 px-2 rounded-lg text-[9px] font-semibold uppercase tracking-wide transition-all duration-200 ${
              activeCategory === category.id
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <SectionCard
        title="Player Rankings"
        icon={<Users className="h-3.5 w-3.5 text-primary/70" />}
      >
        <div className="space-y-3">
          {filteredStandings.length === 0 && (
            <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">
              No players found.
            </p>
          )}

          {sortedGroups.map(([category, categoryStandings]) => (
            <div key={category}>
              <div
                className={`rounded-lg bg-gradient-to-r ${
                  CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Dev
                } ring-1 p-3 space-y-1.5`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-foreground">
                    {category}
                  </h3>

                  <span className="text-[9px] text-muted-foreground">
                    {categoryStandings.length} players
                  </span>
                </div>

                {categoryStandings.map((s, index) => {
                  const isLeader = index === 0 && s.matches > 0;

                  return (
                    <div
                      key={s.player.id}
                      className={`flex items-center gap-3 rounded-lg p-2 transition-all duration-150 ${
                        isLeader
                          ? "bg-white/10 ring-1 ring-white/20"
                          : "bg-white/[0.03] ring-1 ring-white/[0.08]"
                      }`}
                    >
                      {/* Rank */}
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-md text-[9px] font-bold ${
                          isLeader
                            ? "bg-yellow-500/30 text-yellow-300"
                            : "bg-white/10 text-muted-foreground"
                        }`}
                      >
                        {isLeader ? (
                          <Crown className="h-3.5 w-3.5" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>

                      {/* Team Logo / Avatar */}
                      {s.player.team && teamLogos[s.player.team] ? (
                        <div className="relative h-8 w-8 rounded-full bg-zinc-900/80 ring-1 ring-white/[0.08] overflow-hidden flex-shrink-0">
                          <img
                            src={teamLogos[s.player.team]}
                            alt={s.player.team}
                            loading="lazy"
                            decoding="async"
                            className="object-contain p-0.5 w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
                          <span className="text-[9px] font-medium text-foreground">
                            {getInitials(s.player.name)}
                          </span>
                        </div>
                      )}

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-medium text-foreground text-[12px] truncate">
                            {s.player.name}
                          </p>

                          <span className="text-[7px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary/15 text-primary">
                            {s.player.category}
                          </span>

                          {s.player.is_captain ? (
                            <span className="text-[7px] font-bold uppercase px-1 py-0.5 rounded bg-yellow-500/15 text-yellow-300">
                              C
                            </span>
                          ) : null}
                        </div>

                        <p className="text-[9px] text-muted-foreground truncate mt-0.5">
                          <span className="uppercase tracking-wider">
                            {s.player.team ?? "—"}
                          </span>

                          <span>
                            {" "}
                            · {s.matches}M · {s.wins}W–{s.losses}L
                          </span>
                        </p>
                      </div>

                      {/* Points */}
                      <div className="flex flex-col items-end">
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            s.points > 0
                              ? "text-emerald-400"
                              : s.points < 0
                              ? "text-red-400"
                              : "text-foreground"
                          }`}
                        >
                          {s.points > 0 ? "+" : ""}
                          {s.points}
                        </span>

                        <span className="text-[8px] uppercase tracking-wider text-muted-foreground">
                          Pts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <p className="text-center text-[9px] text-muted-foreground/60 pt-1">
            Points = sum of game differences across matches played
          </p>
        </div>
      </SectionCard>
    </div>
  );
});
