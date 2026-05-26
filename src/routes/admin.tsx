import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { SectionCard } from "@/components/SectionCard";
import { GlobalFooter } from "@/components/GlobalFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Plus,
  X,
  ShieldCheck,
  Users,
  Swords,
  ArrowLeft,
  Crown,
} from "lucide-react";
import type { Match, Player } from "@/lib/scoring";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

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
          <PlayersPanel />
          <MatchEntryPanel />
          <MatchListPanel />
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <main className="w-full max-w-[420px] relative">
        <div className="px-5 pb-10 pt-8">
          <Link
            to="/"
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
      // Force the auth hook to re-check the role
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
            This tournament allows exactly one admin. Sign in as that account
            to manage matches.
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent ring-1 ring-primary/30 p-4 text-center space-y-3">
          <p className="text-[12px] text-foreground font-medium">
            No admin has been claimed yet.
          </p>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Claim it now to take exclusive control of player and match
            management. This action is one-time and permanent.
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
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data ?? [];
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
          "id, team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id, team1_games, team2_games, played_at",
        )
        .order("played_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Match[];
    },
  });
}

function PlayersPanel() {
  const qc = useQueryClient();
  const players = usePlayers();
  const [name, setName] = useState("");

  const addPlayer = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const { error } = await supabase.from("players").insert({ name: trimmed });
    if (error) toast.error(error.message);
    else {
      toast.success("Player added");
      setName("");
      qc.invalidateQueries({ queryKey: ["players"] });
    }
  };

  const removePlayer = async (id: string) => {
    if (!confirm("Delete this player?")) return;
    const { error } = await supabase.from("players").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Player deleted");
      qc.invalidateQueries({ queryKey: ["players"] });
    }
  };

  return (
    <SectionCard
      title="Players"
      icon={<Users className="h-4 w-4 text-primary" />}
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player name"
            className="bg-white/[0.03] border-white/[0.06]"
            onKeyDown={(e) => e.key === "Enter" && addPlayer()}
          />
          <Button onClick={addPlayer} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="rounded-xl bg-white/[0.02] ring-1 ring-white/[0.05] divide-y divide-white/[0.04]">
          {(players.data ?? []).length === 0 && (
            <p className="px-3 py-3 text-[11px] text-muted-foreground text-center">
              No players yet.
            </p>
          )}
          {(players.data ?? []).map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between px-3 py-2"
            >
              <span className="text-[12px] text-foreground">{p.name}</span>
              <button
                onClick={() => removePlayer(p.id)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                aria-label="Delete player"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

type MatchForm = {
  team1_player1_id: string;
  team1_player2_id: string;
  team2_player1_id: string;
  team2_player2_id: string;
  team1_games: string;
  team2_games: string;
  played_at: string;
};

const emptyForm = (): MatchForm => ({
  team1_player1_id: "",
  team1_player2_id: "",
  team2_player1_id: "",
  team2_player2_id: "",
  team1_games: "",
  team2_games: "",
  played_at: new Date().toISOString().slice(0, 10),
});

function validateForm(f: MatchForm): string | null {
  const ids = [
    f.team1_player1_id,
    f.team1_player2_id,
    f.team2_player1_id,
    f.team2_player2_id,
  ];
  if (ids.some((id) => !id)) return "Select all four players.";
  if (new Set(ids).size !== 4) return "A player can't be on both teams.";
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
      played_at: new Date(form.played_at).toISOString(),
    });
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
  const set = (k: keyof MatchForm, v: string) => setForm({ ...form, [k]: v });
  return (
    <div className="space-y-3">
      <PairBlock label="Team 1">
        <PlayerSelect
          value={form.team1_player1_id}
          onChange={(v) => set("team1_player1_id", v)}
          players={players}
          exclude={[
            form.team1_player2_id,
            form.team2_player1_id,
            form.team2_player2_id,
          ]}
        />
        <PlayerSelect
          value={form.team1_player2_id}
          onChange={(v) => set("team1_player2_id", v)}
          players={players}
          exclude={[
            form.team1_player1_id,
            form.team2_player1_id,
            form.team2_player2_id,
          ]}
        />
      </PairBlock>
      <PairBlock label="Team 2">
        <PlayerSelect
          value={form.team2_player1_id}
          onChange={(v) => set("team2_player1_id", v)}
          players={players}
          exclude={[
            form.team1_player1_id,
            form.team1_player2_id,
            form.team2_player2_id,
          ]}
        />
        <PlayerSelect
          value={form.team2_player2_id}
          onChange={(v) => set("team2_player2_id", v)}
          players={players}
          exclude={[
            form.team1_player1_id,
            form.team1_player2_id,
            form.team2_player1_id,
          ]}
        />
      </PairBlock>

      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label="T1 games"
          value={form.team1_games}
          onChange={(v) => set("team1_games", v)}
        />
        <NumberField
          label="T2 games"
          value={form.team2_games}
          onChange={(v) => set("team2_games", v)}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Date played
        </Label>
        <Input
          type="date"
          value={form.played_at}
          onChange={(e) => set("played_at", e.target.value)}
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
  const options = useMemo(
    () => players.filter((p) => !exclude.includes(p.id) || p.id === value),
    [players, exclude, value],
  );
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-[12px]">
        <SelectValue placeholder="Player" />
      </SelectTrigger>
      <SelectContent>
        {options.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            {p.name}
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
  const nameById = new Map((players.data ?? []).map((p) => [p.id, p.name]));

  const startEdit = (m: Match) => {
    setEditing(m.id);
    setForm({
      team1_player1_id: m.team1_player1_id,
      team1_player2_id: m.team1_player2_id,
      team2_player1_id: m.team2_player1_id,
      team2_player2_id: m.team2_player2_id,
      team1_games: String(m.team1_games),
      team2_games: String(m.team2_games),
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
        played_at: new Date(form.played_at).toISOString(),
      })
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
        {(matches.data ?? []).map((m) => (
          <div
            key={m.id}
            className="rounded-xl p-3 bg-white/[0.02] ring-1 ring-white/[0.04]"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                {new Date(m.played_at).toLocaleDateString()}
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
                {nameById.get(m.team1_player1_id)} &amp;{" "}
                {nameById.get(m.team1_player2_id)}
              </span>
              <span className="text-primary font-mono mx-2">
                {m.team1_games}–{m.team2_games}
              </span>
              <span className={m.team2_games > m.team1_games ? "font-bold" : ""}>
                {nameById.get(m.team2_player1_id)} &amp;{" "}
                {nameById.get(m.team2_player2_id)}
              </span>
            </div>
          </div>
        ))}

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
