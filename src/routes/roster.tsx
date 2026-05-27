import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/integrations/supabase/client'
import { SectionCard } from '@/components/SectionCard'
import { GlobalFooter } from '@/components/GlobalFooter'
import { Button } from '@/components/ui/button'
import { Users, ArrowLeft, Star } from 'lucide-react'
import type { Player } from '@/lib/scoring'

export const Route = createFileRoute('/roster')({
  component: RouteComponent,
})

const CATEGORY_ORDER: Record<string, number> = {
  M1: 1,
  M2: 2,
  Star: 3,
  Core: 4,
  Dev: 5,
}

function RouteComponent() {
  const { user, isAdmin, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) navigate({ to: '/auth' })
  }, [loading, user, navigate])

  if (loading) {
    return (
      <Shell>
        <p className="text-center text-[11px] text-muted-foreground py-10">
          Loading…
        </p>
      </Shell>
    )
  }

  if (!user) return null

  if (!isAdmin) {
    return (
      <Shell>
        <SectionCard
          title="Admin Access Required"
          icon={<Users className="h-4 w-4 text-primary" />}
        >
          <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
            Roster management is restricted to the tournament administrator.
          </p>
          <Button className="w-full" onClick={() => navigate({ to: '/admin' })}>
            Back to admin
          </Button>
        </SectionCard>
      </Shell>
    )
  }

  return (
    <Shell>
      {/* <SectionCard
        title="Tournament Roster"
        icon={<Users className="h-4 w-4 text-primary" />}
      >
        <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
          This page shows the current player roster, team assignments, and captain badges.
        </p>
      </SectionCard> */}
      <RosterPanel />
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <main className="w-full max-w-[420px] relative">
        <div className="px-5 pb-10 pt-8">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to admin
          </Link>
          {children}
          <GlobalFooter />
        </div>
      </main>
    </div>
  )
}

function usePlayers() {
  return useQuery<Player[]>({
    queryKey: ['players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, team, ranking, category, is_captain')
        .order('team')
        .order('ranking', { ascending: true, nullsFirst: false })
        .order('name')
      if (error) throw error
      return (data ?? []) as unknown as Player[]
    },
  })
}

function groupByTeam(players: Player[]) {
  const map = new Map<string, Player[]>()
  for (const p of players) {
    const t = p.team ?? 'Unassigned'
    if (!map.has(t)) map.set(t, [])
    map.get(t)!.push(p)
  }
  for (const list of map.values()) {
    list.sort(
      (a, b) =>
        (CATEGORY_ORDER[String(a.category)] ?? 99) -
          (CATEGORY_ORDER[String(b.category)] ?? 99) ||
        (a.ranking ?? 99) - (b.ranking ?? 99),
    )
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
}

function RosterPanel() {
  const players = usePlayers()
  const groups = groupByTeam(players.data ?? [])

  return (
    <SectionCard
      title="Tournament Roster"
      icon={<Users className="h-4 w-4 text-primary" />}
    >
      <p className="text-[10px] text-muted-foreground leading-relaxed mb-3">
        Pre-configured teams, players, and rankings used for match entry on the admin page.
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
                    {p.category ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
