// Verification script for the scoring logic.
// Run with: bun run src/lib/scoring.verify.ts
import {
  computePlayerStandings,
  computeTeamStandings,
  teamPointsFor,
  type Match,
  type Player,
} from "./scoring";

const players: Player[] = [
  { id: "p1", name: "Alice", team: "T1" },
  { id: "p2", name: "Bob", team: "T1" },
  { id: "p3", name: "Carol", team: "T2" },
  { id: "p4", name: "Dan", team: "T2" },
];

const matches: Match[] = [
  // Match 1: T1 wins 6-2 (normal) -> T1 +3, T2 +0; players A/B +4 each, C/D -4
  {
    id: "m1",
    team1_player1_id: "p1",
    team1_player2_id: "p2",
    team2_player1_id: "p3",
    team2_player2_id: "p4",
    team1_games: 6,
    team2_games: 2,
    tie_breaker: false,
    played_at: "2025-01-01T00:00:00Z",
  },
  // Match 2: T1 loses 3-6 -> T2 +3, T1 +0; A/B -3, C/D +3
  {
    id: "m2",
    team1_player1_id: "p1",
    team1_player2_id: "p2",
    team2_player1_id: "p3",
    team2_player2_id: "p4",
    team1_games: 3,
    team2_games: 6,
    tie_breaker: false,
    played_at: "2025-01-02T00:00:00Z",
  },
  // Match 3: T1 wins 6-0 (bonus) -> T1 +4, T2 +0
  {
    id: "m3",
    team1_player1_id: "p1",
    team1_player2_id: "p2",
    team2_player1_id: "p3",
    team2_player2_id: "p4",
    team1_games: 6,
    team2_games: 0,
    tie_breaker: false,
    played_at: "2025-01-03T00:00:00Z",
  },
  // Match 4: tiebreak, T2 wins 7-6 -> T2 +2, T1 +1
  {
    id: "m4",
    team1_player1_id: "p1",
    team1_player2_id: "p2",
    team2_player1_id: "p3",
    team2_player2_id: "p4",
    team1_games: 6,
    team2_games: 7,
    tie_breaker: true,
    played_at: "2025-01-04T00:00:00Z",
  },
];

function assertEq(label: string, got: unknown, expected: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(expected);
  console.log(
    `${ok ? "PASS" : "FAIL"} ${label}: got=${JSON.stringify(got)} expected=${JSON.stringify(expected)}`,
  );
  if (!ok) process.exitCode = 1;
}

assertEq("teamPointsFor normal", teamPointsFor(6, 2, false), [3, 0]);
assertEq("teamPointsFor 6-0 bonus", teamPointsFor(6, 0, false), [4, 0]);
assertEq("teamPointsFor tiebreak", teamPointsFor(7, 6, true), [2, 1]);

const ts = computeTeamStandings(players, matches);
const t1 = ts.find((t) => t.team === "T1")!;
const t2 = ts.find((t) => t.team === "T2")!;
// T1 points: +3 (m1) +0 (m2) +4 (m3) +1 (m4 tb loss) = 8
// T2 points: +0 +3 +0 +2 = 5
assertEq("Team T1 points", t1.points, 8);
assertEq("Team T2 points", t2.points, 5);
assertEq("Team T1 W-L", [t1.wins, t1.losses], [2, 2]);

// Player points: per match diff sum
// A,B: +4 -3 +6 -1 = 6
// C,D: -4 +3 -6 +1 = -6
const ps = computePlayerStandings(players, matches);
assertEq("Alice points", ps.find((s) => s.player.id === "p1")!.points, 6);
assertEq("Carol points", ps.find((s) => s.player.id === "p3")!.points, -6);
