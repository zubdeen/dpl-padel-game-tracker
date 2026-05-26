import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  computePlayerStandings,
  computeTeamStandings,
  type Match,
  type Player,
} from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function useLeaderboardData() {
  const players = useQuery<Player[]>({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  const matches = useQuery<Match[]>({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(
          "id, team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id, team1_games, team2_games, played_at",
        )
        .order("played_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Match[];
    },
  });

  return { players, matches };
}

export function Leaderboards() {
  const { players, matches } = useLeaderboardData();

  if (players.isLoading || matches.isLoading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }
  const ps = computePlayerStandings(players.data ?? [], matches.data ?? []);
  const ts = computeTeamStandings(players.data ?? [], matches.data ?? []);
  const playerById = new Map((players.data ?? []).map((p) => [p.id, p.name]));

  return (
    <Tabs defaultValue="teams" className="w-full">
      <TabsList className="grid w-full grid-cols-3 max-w-md">
        <TabsTrigger value="teams">Teams</TabsTrigger>
        <TabsTrigger value="players">Players</TabsTrigger>
        <TabsTrigger value="history">Match history</TabsTrigger>
      </TabsList>

      <TabsContent value="teams">
        <Card>
          <CardHeader>
            <CardTitle>Team leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Pair</TableHead>
                  <TableHead className="text-right">Matches</TableHead>
                  <TableHead className="text-right">W</TableHead>
                  <TableHead className="text-right">L</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No matches yet.
                    </TableCell>
                  </TableRow>
                )}
                {ts.map((t, i) => (
                  <TableRow key={t.key}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-medium">
                      {t.players[0].name} &amp; {t.players[1].name}
                    </TableCell>
                    <TableCell className="text-right">{t.matches}</TableCell>
                    <TableCell className="text-right">{t.wins}</TableCell>
                    <TableCell className="text-right">{t.losses}</TableCell>
                    <TableCell className="text-right font-mono">
                      {t.totalDelta > 0 ? "+" : ""}
                      {t.totalDelta}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="players">
        <Card>
          <CardHeader>
            <CardTitle>Player leaderboard</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Matches</TableHead>
                  <TableHead className="text-right">W</TableHead>
                  <TableHead className="text-right">L</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Avg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ps.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No players yet.
                    </TableCell>
                  </TableRow>
                )}
                {ps.map((s, i) => (
                  <TableRow key={s.player.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-medium">{s.player.name}</TableCell>
                    <TableCell className="text-right">{s.matches}</TableCell>
                    <TableCell className="text-right">{s.wins}</TableCell>
                    <TableCell className="text-right">{s.losses}</TableCell>
                    <TableCell className="text-right font-mono">
                      {s.totalDelta > 0 ? "+" : ""}
                      {s.totalDelta}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {s.matches > 0 ? s.average.toFixed(2) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <CardTitle>Match history</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Team 1</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead>Team 2</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(matches.data ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No matches recorded yet.
                    </TableCell>
                  </TableRow>
                )}
                {(matches.data ?? []).map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {new Date(m.played_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell
                      className={
                        m.team1_games > m.team2_games ? "font-semibold" : ""
                      }
                    >
                      {playerById.get(m.team1_player1_id) ?? "?"} &amp;{" "}
                      {playerById.get(m.team1_player2_id) ?? "?"}
                    </TableCell>
                    <TableCell className="text-center font-mono">
                      {m.team1_games} – {m.team2_games}
                    </TableCell>
                    <TableCell
                      className={
                        m.team2_games > m.team1_games ? "font-semibold" : ""
                      }
                    >
                      {playerById.get(m.team2_player1_id) ?? "?"} &amp;{" "}
                      {playerById.get(m.team2_player2_id) ?? "?"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
