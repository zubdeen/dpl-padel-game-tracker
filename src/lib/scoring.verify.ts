// Verification script for the scoring logic.
// Run with: bun run src/lib/scoring.verify.ts
import {
  computePlayerStandings,
  computeTeamStandings,
  type Match,
  type Player,
} from "./scoring";

const players: Player[] = [
  { id: "p1", name: "Alice" },
  { id: "p2", name: "Bob" },
  { id: "p3", name: "Carol" },
  { id: "p4", name: "Dan" },
];

// Spec example: Team 1 (Alice+Bob) wins 6-2 (diff +4),
// then Team 1 loses 5-6 (diff -1). Average per player = (4 + -1)/2 = 1.5.
// The user-stated example value 3 in the prompt is sum/2 of {4,-1,... ?} which is
// inconsistent; we follow the formula given: (sum of diffs) / matches.
const matches: Match[] = [
  {
    id: "m1",
    team1_player1_id: "p1",
    team1_player2_id: "p2",
    team2_player1_id: "p3",
    team2_player2_id: "p4",
    team1_games: 6,
    team2_games: 2,
    played_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "m2",
    team1_player1_id: "p1",
    team1_player2_id: "p2",
    team2_player1_id: "p3",
    team2_player2_id: "p4",
    team1_games: 5,
    team2_games: 6,
    played_at: "2025-01-02T00:00:00Z",
  },
];

const ps = computePlayerStandings(players, matches);
const ts = computeTeamStandings(players, matches);

console.log("Player standings:");
for (const s of ps) {
  console.log(
    `  ${s.player.name.padEnd(8)} matches=${s.matches} W-L=${s.wins}-${s.losses} totalDelta=${s.totalDelta} avg=${s.average}`,
  );
}
console.log("\nTeam standings:");
for (const t of ts) {
  console.log(
    `  ${t.players[0].name}+${t.players[1].name} matches=${t.matches} W-L=${t.wins}-${t.losses} totalDelta=${t.totalDelta}`,
  );
}

function assertEq(label: string, got: unknown, expected: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(expected);
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}: got=${JSON.stringify(got)} expected=${JSON.stringify(expected)}`);
  if (!ok) process.exitCode = 1;
}

const alice = ps.find((s) => s.player.id === "p1")!;
const carol = ps.find((s) => s.player.id === "p3")!;
assertEq("Alice totalDelta", alice.totalDelta, 3);
assertEq("Alice matches", alice.matches, 2);
assertEq("Alice average", alice.average, 1.5);
assertEq("Carol totalDelta", carol.totalDelta, -3);
assertEq("Carol average", carol.average, -1.5);

const team1 = ts.find((t) => t.players.some((p) => p.id === "p1"))!;
assertEq("Team Alice+Bob totalDelta", team1.totalDelta, 3);
assertEq("Team Alice+Bob W-L", [team1.wins, team1.losses], [1, 1]);
