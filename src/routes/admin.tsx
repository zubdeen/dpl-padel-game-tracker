import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Leaderboards, useLeaderboardData } from "@/components/Leaderboards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading) return <FullPage>Loading…</FullPage>;
  if (!user) return null;

  if (!isAdmin) {
    return (
      <FullPage>
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Not an admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              You're signed in as <span className="font-mono">{user.email}</span>{" "}
              but you don't have the admin role.
            </p>
            <p>
              Open the backend dashboard, go to the{" "}
              <span className="font-mono">user_roles</span> table, and insert a
              row with <span className="font-mono">user_id =</span>{" "}
              <span className="font-mono">{user.id}</span> and{" "}
              <span className="font-mono">role = 'admin'</span>. Then refresh.
            </p>
            <Link to="/" className="underline">
              Back to leaderboards
            </Link>
          </CardContent>
        </Card>
      </FullPage>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl font-bold">Admin dashboard</h1>
        <div className="grid gap-8 lg:grid-cols-2">
          <PlayersPanel />
          <MatchEntryPanel />
        </div>
        <MatchAdminList />
        <section>
          <h2 className="text-2xl font-semibold mb-4">Live leaderboards</h2>
          <Leaderboards />
        </section>
      </main>
    </div>
  );
}

function FullPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 flex justify-center">
        {children}
      </main>
    </div>
  );
}

function PlayersPanel() {
  const qc = useQueryClient();
  const { players } = useLeaderboardData();
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
    if (!confirm("Delete this player? Only allowed if they're in no matches.")) return;
    const { error } = await supabase.from("players").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Player deleted");
      qc.invalidateQueries({ queryKey: ["players"] });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Players</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player name"
            onKeyDown={(e) => e.key === "Enter" && addPlayer()}
          />
          <Button onClick={addPlayer}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <ul className="divide-y divide-border rounded-md border">
          {(players.data ?? []).length === 0 && (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              No players yet.
            </li>
          )}
          {(players.data ?? []).map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between px-3 py-2"
            >
              <span>{p.name}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removePlayer(p.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
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

function MatchEntryPanel() {
  const qc = useQueryClient();
  const { players } = useLeaderboardData();
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
    <Card>
      <CardHeader>
        <CardTitle>Record a match</CardTitle>
      </CardHeader>
      <CardContent>
        <MatchFormFields
          form={form}
          setForm={setForm}
          players={players.data ?? []}
        />
        <Button className="w-full mt-4" onClick={submit}>
          Save match
        </Button>
      </CardContent>
    </Card>
  );
}

function MatchFormFields({
  form,
  setForm,
  players,
}: {
  form: MatchForm;
  setForm: (f: MatchForm) => void;
  players: { id: string; name: string }[];
}) {
  const set = (k: keyof MatchForm, v: string) => setForm({ ...form, [k]: v });
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Team 1</Label>
        <div className="grid grid-cols-2 gap-2">
          <PlayerSelect
            value={form.team1_player1_id}
            onChange={(v) => set("team1_player1_id", v)}
            players={players}
            exclude={[form.team1_player2_id, form.team2_player1_id, form.team2_player2_id]}
          />
          <PlayerSelect
            value={form.team1_player2_id}
            onChange={(v) => set("team1_player2_id", v)}
            players={players}
            exclude={[form.team1_player1_id, form.team2_player1_id, form.team2_player2_id]}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Team 2</Label>
        <div className="grid grid-cols-2 gap-2">
          <PlayerSelect
            value={form.team2_player1_id}
            onChange={(v) => set("team2_player1_id", v)}
            players={players}
            exclude={[form.team1_player1_id, form.team1_player2_id, form.team2_player2_id]}
          />
          <PlayerSelect
            value={form.team2_player2_id}
            onChange={(v) => set("team2_player2_id", v)}
            players={players}
            exclude={[form.team1_player1_id, form.team1_player2_id, form.team2_player1_id]}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label>Team 1 games</Label>
          <Input
            type="number"
            min={0}
            value={form.team1_games}
            onChange={(e) => set("team1_games", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Team 2 games</Label>
          <Input
            type="number"
            min={0}
            value={form.team2_games}
            onChange={(e) => set("team2_games", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Date played</Label>
        <Input
          type="date"
          value={form.played_at}
          onChange={(e) => set("played_at", e.target.value)}
        />
      </div>
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
  players: { id: string; name: string }[];
  exclude: string[];
}) {
  const options = useMemo(
    () => players.filter((p) => !exclude.includes(p.id) || p.id === value),
    [players, exclude, value],
  );
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select player" />
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

function MatchAdminList() {
  const qc = useQueryClient();
  const { players, matches } = useLeaderboardData();
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<MatchForm>(emptyForm);
  const playerById = new Map((players.data ?? []).map((p) => [p.id, p.name]));

  const startEdit = (m: NonNullable<typeof matches.data>[number]) => {
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
    if (!confirm("Delete this match? Leaderboards will recalculate.")) return;
    const { error } = await supabase.from("matches").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Match deleted");
      qc.invalidateQueries({ queryKey: ["matches"] });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage matches</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Team 1</TableHead>
              <TableHead className="text-center">Score</TableHead>
              <TableHead>Team 2</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(matches.data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No matches yet.
                </TableCell>
              </TableRow>
            )}
            {(matches.data ?? []).map((m) => (
              <TableRow key={m.id}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(m.played_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {playerById.get(m.team1_player1_id) ?? "?"} &amp;{" "}
                  {playerById.get(m.team1_player2_id) ?? "?"}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {m.team1_games} – {m.team2_games}
                </TableCell>
                <TableCell>
                  {playerById.get(m.team2_player1_id) ?? "?"} &amp;{" "}
                  {playerById.get(m.team2_player2_id) ?? "?"}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => startEdit(m)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(m.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {editing && (
          <div className="mt-6 rounded-md border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Edit match</h3>
              <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
            <MatchFormFields
              form={form}
              setForm={setForm}
              players={players.data ?? []}
            />
            <Button onClick={saveEdit}>Save changes</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
