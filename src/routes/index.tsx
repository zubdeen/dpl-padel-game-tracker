import { useState, useEffect, useRef, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Navigation, type TabId } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { GlobalFooter } from "@/components/GlobalFooter";
import { StandingsSection } from "@/components/sections/StandingsSection";
import { PlayersSection } from "@/components/sections/PlayersSection";
import { TeamsSection } from "@/components/sections/TeamsSection";
import { FixturesSection } from "@/components/sections/FixturesSection";
import { BankingSection } from "@/components/sections/banking-section";
import { ScheduleSection } from "@/components/sections/schedule-section";
import { RulesSection } from "@/components/sections/rules-section";
import type { Match, Player } from "@/lib/scoring";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("standings");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollPositions = useRef<Record<TabId, number>>({
    standings: 0,
    players: 0,
    teams: 0,
    fixtures: 0,
    admin: 0,
  });

  const players = useQuery<Player[]>({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, team, ranking, category, is_captain")
        .order("team")
        .order("ranking", { ascending: true, nullsFirst: false })
        .order("name");
      if (error) throw error;
      return (data ?? []) as unknown as Player[];
    },
  });

  const matches = useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(
          "id, team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id, team1_games, team2_games, tie_breaker, played_at",
        )
        .order("played_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Match[];
    },
  });

  const handleTabChange = (newTab: TabId) => {
    if (newTab === "admin") {
      navigate({ to: "/admin" });
      return;
    }
    scrollPositions.current[activeTab] = window.scrollY;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setIsTransitioning(false);
      setTimeout(() => {
        window.scrollTo(0, scrollPositions.current[newTab]);
      }, 50);
    }, 150);
  };

  const ps = players.data ?? [];
  const ms = matches.data ?? [];

  const renderContent = (): ReactNode => {
    switch (activeTab) {
      case "players":
        return <PlayersSection players={ps} matches={ms} />;
      case "teams":
        return <TeamsSection players={ps} />;
      case "fixtures":
        return <FixturesSection players={ps} matches={ms} />;
      case "standings":
        return <StandingsSection players={ps} matches={ms} />;
      case "banking":
        return <BankingSection />;
      case "schedule":
        return <ScheduleSection />;
      case "rules":
        return <RulesSection />;
      default:
        return (
          <div className="space-y-4">
            <HeroSection playerCount={ps.length} matchCount={ms.length} />
            <StandingsSection players={ps} matches={ms} />
            <PlayersSection players={ps} matches={ms} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <main className="w-full max-w-[420px] relative">
        <Navigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          showAdmin={isAdmin}
        />
        <div className="px-5 pb-10 pt-20">
          <div
            className={`transition-all duration-200 ease-out ${
              isTransitioning
                ? "opacity-0 translate-y-2"
                : "opacity-100 translate-y-0"
            }`}
          >
            {players.isLoading || matches.isLoading ? (
              <p className="text-center text-[11px] text-muted-foreground py-10">
                Loading…
              </p>
            ) : (
              renderContent()
            )}
          </div>
          <GlobalFooter />
        </div>
      </main>
    </div>
  );
}
