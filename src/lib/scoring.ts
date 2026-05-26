// Padel tournament scoring logic.
// Rules (per product spec):
//  - For each match: difference = team1_games - team2_games.
//    Every player on team1 gets +difference; every player on team2 gets -difference.
//  - Player score (shown on leaderboard) = sum(deltas) / matchesPlayedByPlayer.
//  - Team (pair) score = cumulative sum of deltas for that exact pair.

export type Player = { id: string; name: string };

export type Match = {
  id: string;
  team1_player1_id: string;
  team1_player2_id: string;
  team2_player1_id: string;
  team2_player2_id: string;
  team1_games: number;
  team2_games: number;
  played_at: string;
};

export type PlayerStanding = {
  player: Player;
  matches: number;
  wins: number;
  losses: number;
  gamesFor: number;
  gamesAgainst: number;
  totalDelta: number;
  average: number; // totalDelta / matches
};

export type TeamStanding = {
  key: string; // sorted "id1|id2"
  players: [Player, Player];
  matches: number;
  wins: number;
  losses: number;
  totalDelta: number;
};

const pairKey = (a: string, b: string) => [a, b].sort().join("|");

export function computePlayerStandings(
  players: Player[],
  matches: Match[],
): PlayerStanding[] {
  const byId = new Map(players.map((p) => [p.id, p]));
  const acc = new Map<string, PlayerStanding>();

  const ensure = (id: string): PlayerStanding => {
    let s = acc.get(id);
    if (!s) {
      const player = byId.get(id) ?? { id, name: "Unknown" };
      s = {
        player,
        matches: 0,
        wins: 0,
        losses: 0,
        gamesFor: 0,
        gamesAgainst: 0,
        totalDelta: 0,
        average: 0,
      };
      acc.set(id, s);
    }
    return s;
  };

  for (const m of matches) {
    const delta = m.team1_games - m.team2_games;
    const team1 = [m.team1_player1_id, m.team1_player2_id];
    const team2 = [m.team2_player1_id, m.team2_player2_id];

    for (const pid of team1) {
      const s = ensure(pid);
      s.matches += 1;
      s.totalDelta += delta;
      s.gamesFor += m.team1_games;
      s.gamesAgainst += m.team2_games;
      if (delta > 0) s.wins += 1;
      else if (delta < 0) s.losses += 1;
    }
    for (const pid of team2) {
      const s = ensure(pid);
      s.matches += 1;
      s.totalDelta += -delta;
      s.gamesFor += m.team2_games;
      s.gamesAgainst += m.team1_games;
      if (-delta > 0) s.wins += 1;
      else if (-delta < 0) s.losses += 1;
    }
  }

  // Include players with no matches so they appear at the bottom
  for (const p of players) ensure(p.id);

  return [...acc.values()]
    .map((s) => ({
      ...s,
      average: s.matches > 0 ? s.totalDelta / s.matches : 0,
    }))
    .sort(
      (a, b) =>
        b.average - a.average ||
        b.totalDelta - a.totalDelta ||
        b.wins - a.wins ||
        a.player.name.localeCompare(b.player.name),
    );
}

export function computeTeamStandings(
  players: Player[],
  matches: Match[],
): TeamStanding[] {
  const byId = new Map(players.map((p) => [p.id, p]));
  const acc = new Map<string, TeamStanding>();

  const ensure = (a: string, b: string): TeamStanding => {
    const key = pairKey(a, b);
    let t = acc.get(key);
    if (!t) {
      const pa = byId.get(a) ?? { id: a, name: "Unknown" };
      const pb = byId.get(b) ?? { id: b, name: "Unknown" };
      const pair = ([pa, pb].sort((x, y) => x.name.localeCompare(y.name))) as [
        Player,
        Player,
      ];
      t = { key, players: pair, matches: 0, wins: 0, losses: 0, totalDelta: 0 };
      acc.set(key, t);
    }
    return t;
  };

  for (const m of matches) {
    const delta = m.team1_games - m.team2_games;
    const t1 = ensure(m.team1_player1_id, m.team1_player2_id);
    t1.matches += 1;
    t1.totalDelta += delta;
    if (delta > 0) t1.wins += 1;
    else if (delta < 0) t1.losses += 1;

    const t2 = ensure(m.team2_player1_id, m.team2_player2_id);
    t2.matches += 1;
    t2.totalDelta += -delta;
    if (-delta > 0) t2.wins += 1;
    else if (-delta < 0) t2.losses += 1;
  }

  return [...acc.values()].sort(
    (a, b) =>
      b.totalDelta - a.totalDelta ||
      b.wins - a.wins ||
      a.players[0].name.localeCompare(b.players[0].name),
  );
}
