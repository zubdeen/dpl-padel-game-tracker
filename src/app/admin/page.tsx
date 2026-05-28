"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { SectionCard } from "@/components/SectionCard";
import { GlobalFooter } from "@/components/GlobalFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  ShieldCheck,
  Users,
  Swords,
  ArrowLeft,
  Crown,
  Star,
} from "lucide-react";
import type { Match, Player } from "@/lib/scoring";

const CATEGORY_ORDER: Record<string, number> = {
  M1: 1,
  M2: 2,
  Star: 3,
  Core: 4,
  Dev: 5,
};

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [loading, user, router]);

  if (loading) {
    return (
      <Shell>
        <p className="text-center text-[11px] text-muted-foreground py-10">
          Loading…
        </p>
      </Shell>
    );
  }
  if (!user) return null;

  return (
    <Shell>
      <div className="py-5 text-center mb-4">
        <div className="flex justify-center mb-3">
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent ring-1 ring-primary/30 flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
        </div>
        <h1 className="text-lg font-bold tracking-tight text-foreground uppercase">
          Admin Dashboard
        </h1>
        <p className="text-[10px] text-muted-foreground mt-1 truncate">
          {user.email}
        </p>
      </div>

      {!isAdmin ? (
        <ClaimAdminCard />
      ) : (
        <div className="space-y-4">
          <ViewAllPlayersCard />
          <MatchEntryPanel />
          <MatchListPanel />
        </div>
      )}
    </Shell>
  );
}

function ViewAllPlayersCard() {
  const router = useRouter();

  return (
    <SectionCard
      title="Tournament Roster"
      icon={<Users className="h-4 w-4 text-primary" />}
    >
      <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
        View the full player roster and team assignments on a dedicated page.
      </p>
      <Button className="w-full" onClick={() => router.push("/roster")}>
        View all players
      </Button>
    </SectionCard>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <main className="w-full max-w-[420px] relative">
        <div className="px-5 pb-10 pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to standings
          </Link>
          {children}
          <GlobalFooter />
        </div>
      </main>
    </div>
  );
}

function ClaimAdminCard() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const claimed = useQuery({
    queryKey: ["admin_claimed"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_claimed");
      if (error) throw error;
      return data as boolean;
    },
  });

  const claim = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("claim_admin");
    setBusy(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("You are now the admin");
      qc.invalidateQueries();
      window.location.reload();
    }
  };

  return (
    <SectionCard
      title="Admin Seat"
      icon={<Crown className="h-4 w-4 text-primary" />}
    >
      {claimed.isLoading ? (
        <p className="text-[11px] text-muted-foreground">Checking…</p>
      ) : claimed.data ? (
        <div className="rounded-xl bg-white/[0.02] ring-1 ring-white/[0.05] p-4 text-center">
          <p className="text-[12px] text-foreground font-medium">
            The admin seat is already taken.
          </p>
          <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
            This tournament allows exactly one admin.
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent ring-1 ring-primary/30 p-4 text-center space-y-3">
          <p className="text-[12px] text-foreground font-medium">
            No admin claimed yet.
          </p>
          <Button onClick={claim} disabled={busy} className="w-full">
            {busy ? "Claiming…" : "Claim admin seat"}
          </Button>
        </div>
      )}
    </SectionCard>
  );
}

function usePlayers() {
  return useQuery<Player[]>({
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
}

function useMatches() {
  return useQuery<Match[]>({
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
}

function groupByTeam(players: Player[]) {
  const map = new Map<string, Player[]>();
  for (const p of players) {
    const t = p.team ?? "Unassigned";
    if (!map.has(t)) map.set(t, []);
    map.get(t)!.push(p);
  }
  for (const list of map.values()) {
    list.sort(
      (a, b) =>
        (CATEGORY_ORDER[String(a.category)] ?? 99) -
          (CATEGORY_ORDER[String(b.category)] ?? 99) ||
        (a.ranking ?? 99) - (b.ranking ?? 99),
    );
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function RosterPanel() {
  const players = usePlayers();
  const groups = groupByTeam(players.data ?? []);

  return (
    <SectionCard
      title="Tournament Roster"
      icon={<Users className="h-4 w-4 text-primary" />}
    >
      <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
        Pre-configured teams, players, and rankings used for match entry below.
      </p>
      <div className="space-y-3">
        {groups.length === 0 && (
          <p className="text-[11px] text-muted-foreground text-center py-4">
            No players configured.
          </p>
        )}
        {groups.map(([team, list]) => (
          <div
            key={team}
            className="rounded-xl bg-white/[0.02] ring-1 ring-white/[0.05] p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-foreground">
                {team}
              </h3>
              <span className="text-[9px] text-muted-foreground">
                {list.length} players
              </span>
            </div>
            <div className="space-y-1">
              {list.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-[11px]"
                >
                  <span className="text-foreground/90 flex items-center gap-1">
                    {p.name}
                    {p.is_captain ? (
                      <Star className="h-3 w-3 text-primary fill-primary" />
                    ) : null}
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-primary/70">
                    {p.category ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

type MatchForm = {
  team1: string;
  team2: string;
  team1_player1_id: string;
  team1_player2_id: string;
  team2_player1_id: string;
  team2_player2_id: string;
  team1_games: string;
  team2_games: string;
  tie_breaker: boolean;
  played_at: string;
};

const emptyForm = (): MatchForm => ({
  team1: "",
  team2: "",
  team1_player1_id: "",
  team1_player2_id: "",
  team2_player1_id: "",
  team2_player2_id: "",
  team1_games: "",
  team2_games: "",
  tie_breaker: false,
  played_at: new Date().toISOString().slice(0, 10),
});

function validateForm(f: MatchForm): string | null {
  if (!f.team1 || !f.team2) return "Pick both teams.";
  if (f.team1 === f.team2) return "Teams must be different.";
  const ids = [
    f.team1_player1_id,
    f.team1_player2_id,
    f.team2_player1_id,
    f.team2_player2_id,
  ];
  if (ids.some((id) => !id)) return "Select two players for each team.";
  if (new Set(ids).size !== 4) return "A player can't be picked twice.";
  const g1 = parseInt(f.team1_games, 10);
  const g2 = parseInt(f.team2_games, 10);
  if (!Number.isFinite(g1) || !Number.isFinite(g2) || g1 < 0 || g2 < 0)
    return "Enter valid game scores.";
  if (g1 === g2) return "Game scores can't be tied.";
  if (!f.played_at) return "Pick a date.";
  return null;
}

function MatchEntryPanel() {
  const qc = useQueryClient();
  const players = usePlayers();
  const [form, setForm] = useState<MatchForm>(emptyForm);

  const submit = async () => {
    const err = validateForm(form);
    if (err) return toast.error(err);
    const { error } = await supabase.from("matches").insert({
      team1_player1_id: form.team1_player1_id,
      team1_player2_id: form.team1_player2_id,
      team2_player1_id: form.team2_player1_id,
      team2_player2_id: form.team2_player2_id,
      team1_games: parseInt(form.team1_games, 10),
      team2_games: parseInt(form.team2_games, 10),
      tie_breaker: form.tie_breaker,
      played_at: new Date(form.played_at).toISOString(),
    } as never);
    if (error) return toast.error(error.message);
    toast.success("Match recorded");
    setForm(emptyForm());
    qc.invalidateQueries({ queryKey: ["matches"] });
  };

  return (
    <SectionCard
      title="Record Match"
      icon={<Swords className="h-4 w-4 text-primary" />}
    >
      <MatchFormFields
        form={form}
        setForm={setForm}
        players={players.data ?? []}
      />
      <Button className="w-full mt-4" onClick={submit}>
        Save match
      </Button>
    </SectionCard>
  );
}

function MatchFormFields({
  form,
  setForm,
  players,
}: {
  form: MatchForm;
  setForm: (f: MatchForm) => void;
  players: Player[];
}) {
  const teams = useMemo(() => {
    const s = new Set<string>();
    for (const p of players) if (p.team) s.add(p.team);
    return [...s].sort();
  }, [players]);

  const set = (patch: Partial<MatchForm>) => setForm({ ...form, ...patch });

  const playersOnTeam = (team: string) =>
    players
      .filter((p) => p.team === team)
      .sort(
        (a, b) =>
          (CATEGORY_ORDER[String(a.category)] ?? 99) -
            (CATEGORY_ORDER[String(b.category)] ?? 99) ||
          (a.ranking ?? 99) - (b.ranking ?? 99),
      );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Team 1
          </Label>
          <Select
            value={form.team1}
            onValueChange={(v) =>
              set({
                team1: v,
                team1_player1_id: "",
                team1_player2_id: "",
              })
            }
          >
            <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-[12px]">
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              {teams
                .filter((t) => t !== form.team2)
                .map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Team 2
          </Label>
          <Select
            value={form.team2}
            onValueChange={(v) =>
              set({
                team2: v,
                team2_player1_id: "",
                team2_player2_id: "",
              })
            }
          >
            <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-[12px]">
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              {teams
                .filter((t) => t !== form.team1)
                .map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {form.team1 ? (
        <PairBlock label={`${form.team1} pair`}>
          <PlayerSelect
            value={form.team1_player1_id}
            onChange={(v) => set({ team1_player1_id: v })}
            players={playersOnTeam(form.team1)}
            exclude={[form.team1_player2_id]}
          />
          <PlayerSelect
            value={form.team1_player2_id}
            onChange={(v) => set({ team1_player2_id: v })}
            players={playersOnTeam(form.team1)}
            exclude={[form.team1_player1_id]}
          />
        </PairBlock>
      ) : null}

      {form.team2 ? (
        <PairBlock label={`${form.team2} pair`}>
          <PlayerSelect
            value={form.team2_player1_id}
            onChange={(v) => set({ team2_player1_id: v })}
            players={playersOnTeam(form.team2)}
            exclude={[form.team2_player2_id]}
          />
          <PlayerSelect
            value={form.team2_player2_id}
            onChange={(v) => set({ team2_player2_id: v })}
            players={playersOnTeam(form.team2)}
            exclude={[form.team2_player1_id]}
          />
        </PairBlock>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="T1 games"
          value={form.team1_games}
          onChange={(v) => set({ team1_games: v })}
        />
        <NumberField
          label="T2 games"
          value={form.team2_games}
          onChange={(v) => set({ team2_games: v })}
        />
      </div>

      <label className="flex items-center gap-2 rounded-xl bg-white/[0.02] ring-1 ring-white/[0.05] px-3 py-2 cursor-pointer">
        <Checkbox
          checked={form.tie_breaker}
          onCheckedChange={(v) => set({ tie_breaker: v === true })}
        />
        <span className="text-[11px] text-foreground">
          Match went to a tiebreak
        </span>
      </label>

      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Date played
        </Label>
        <Input
          type="date"
          value={form.played_at}
          onChange={(e) => set({ played_at: e.target.value })}
          className="bg-white/[0.03] border-white/[0.06]"
        />
      </div>
    </div>
  );
}

function PairBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white/[0.03] border-white/[0.06] tabular-nums"
      />
    </div>
  );
}

function PlayerSelect({
  value,
  onChange,
  players,
  exclude,
}: {
  value: string;
  onChange: (v: string) => void;
  players: Player[];
  exclude: string[];
}) {
  const options = players.filter(
    (p) => !exclude.includes(p.id) || p.id === value,
  );
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-[12px]">
        <SelectValue placeholder="Player" />
      </SelectTrigger>
      <SelectContent>
        {options.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name} {p.category ? `· ${p.category}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MatchListPanel() {
  const qc = useQueryClient();
  const players = usePlayers();
  const matches = useMatches();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<MatchForm>(emptyForm);
  const playerById = new Map((players.data ?? []).map((p) => [p.id, p]));

  const startEdit = (m: Match) => {
    const t1 = playerById.get(m.team1_player1_id)?.team ?? "";
    const t2 = playerById.get(m.team2_player1_id)?.team ?? "";
    setEditing(m.id);
    setForm({
      team1: t1,
      team2: t2,
      team1_player1_id: m.team1_player1_id,
      team1_player2_id: m.team1_player2_id,
      team2_player1_id: m.team2_player1_id,
      team2_player2_id: m.team2_player2_id,
      team1_games: String(m.team1_games),
      team2_games: String(m.team2_games),
      tie_breaker: !!m.tie_breaker,
      played_at: new Date(m.played_at).toISOString().slice(0, 10),
    });
  };

  const saveEdit = async () => {
    const err = validateForm(form);
    if (err) return toast.error(err);
    if (!editing) return;
    const { error } = await supabase
      .from("matches")
      .update({
        team1_player1_id: form.team1_player1_id,
        team1_player2_id: form.team1_player2_id,
        team2_player1_id: form.team2_player1_id,
        team2_player2_id: form.team2_player2_id,
        team1_games: parseInt(form.team1_games, 10),
        team2_games: parseInt(form.team2_games, 10),
        tie_breaker: form.tie_breaker,
        played_at: new Date(form.played_at).toISOString(),
      } as never)
      .eq("id", editing);
    if (error) return toast.error(error.message);
    toast.success("Match updated");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["matches"] });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    const { error } = await supabase.from("matches").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Match deleted");
      qc.invalidateQueries({ queryKey: ["matches"] });
    }
  };

  return (
    <SectionCard
      title="Manage Matches"
      icon={<Swords className="h-4 w-4 text-primary" />}
    >
      <div className="space-y-2">
        {(matches.data ?? []).length === 0 && (
          <p className="px-2 py-6 text-center text-[11px] text-muted-foreground">
            No matches yet.
          </p>
        )}
        {(matches.data ?? []).map((m) => {
          const t1 = playerById.get(m.team1_player1_id)?.team ?? "?";
          const t2 = playerById.get(m.team2_player1_id)?.team ?? "?";
          return (
            <div
              key={m.id}
              className="rounded-xl p-3 bg-white/[0.02] ring-1 ring-white/[0.04]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  {new Date(m.played_at).toLocaleDateString()}
                  {m.tie_breaker ? " · TB" : ""}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(m)}
                    className="text-muted-foreground hover:text-primary p-1"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => remove(m.id)}
                    className="text-muted-foreground hover:text-destructive p-1"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-foreground">
                <span className={m.team1_games > m.team2_games ? "font-bold" : ""}>
                  {t1}
                </span>
                <span className="text-primary font-mono mx-2">
                  {m.team1_games}–{m.team2_games}
                </span>
                <span className={m.team2_games > m.team1_games ? "font-bold" : ""}>
                  {t2}
                </span>
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">
                {playerById.get(m.team1_player1_id)?.name} &amp;{" "}
                {playerById.get(m.team1_player2_id)?.name} vs{" "}
                {playerById.get(m.team2_player1_id)?.name} &amp;{" "}
                {playerById.get(m.team2_player2_id)?.name}
              </div>
            </div>
          );
        })}

        {editing && (
          <div className="mt-4 rounded-xl bg-white/[0.02] ring-1 ring-primary/20 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-semibold text-foreground">
                Edit match
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="text-[10px] text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
            <MatchFormFields
              form={form}
              setForm={setForm}
              players={players.data ?? []}
            />
            <Button onClick={saveEdit} className="w-full" size="sm">
              Save changes
            </Button>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
