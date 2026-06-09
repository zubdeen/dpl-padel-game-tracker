"use client"

import { useEffect, useState, memo } from "react"
import { SectionCard } from "@/components/SectionCard"
import { teamLogos } from "@/lib/team-logos"
import { Calendar, MapPin, Users, Trophy, ChevronDown, Youtube, ExternalLink } from "lucide-react"

interface CourtMatch {
  court: number
  homeTeam: string | null
  awayTeam: string | null
}

interface MatchNight {
  night: number
  date: string
  dateKey: string
  day: string
  time: string
  courts: CourtMatch[]
  sittingOut: string[]
}

// Official DPL Season 4 League Phase Schedule
const leaguePhaseData: MatchNight[] = [
  {
    night: 1,
    date: "27 MAY",
    dateKey: "2026-05-27",
    day: "WED",
    time: "18:00",
    courts: [
      { court: 1, homeTeam: "SMASH MASTERS", awayTeam: "SMASH BROS GC" },
      { court: 2, homeTeam: null, awayTeam: null },
    ],
    sittingOut: ["TOKOLOSHE", "ACE DEUCE", "VIBORA RAPTORS", "LOS TOROS"],
  },
  {
    night: 2,
    date: "30 MAY",
    dateKey: "2026-05-30",
    day: "SAT",
    time: "18:00",
    courts: [
      { court: 1, homeTeam: "TOKOLOSHE", awayTeam: "LOS TOROS" },
      { court: 2, homeTeam: "SMASH BROS GC", awayTeam: "ACE DEUCE" },
    ],
    sittingOut: ["VIBORA RAPTORS", "SMASH MASTERS"],
  },
  {
    night: 3,
    date: "03 JUN",
    dateKey: "2026-06-03",
    day: "WED",
    time: "18:00",
    courts: [
      { court: 1, homeTeam: "ACE DEUCE", awayTeam: "LOS TOROS" },
      { court: 2, homeTeam: "VIBORA RAPTORS", awayTeam: "TOKOLOSHE" },
    ],
    sittingOut: ["SMASH MASTERS", "SMASH BROS GC"],
  },
  {
    night: 4,
    date: "05 JUN",
    dateKey: "2026-06-05",
    day: "FRI",
    time: "18:00",
    courts: [
      { court: 1, homeTeam: "SMASH MASTERS", awayTeam: "ACE DEUCE" },
      { court: 2, homeTeam: "VIBORA RAPTORS", awayTeam: "LOS TOROS" },
    ],
    sittingOut: ["TOKOLOSHE", "SMASH BROS GC"],
  },
  {
    night: 5,
    date: "10 JUN",
    dateKey: "2026-06-10",
    day: "WED",
    time: "18:00",
    courts: [
      { court: 1, homeTeam: "TOKOLOSHE", awayTeam: "ACE DEUCE" },
      { court: 2, homeTeam: "VIBORA RAPTORS", awayTeam: "SMASH BROS GC" },
    ],
    sittingOut: ["SMASH MASTERS", "LOS TOROS"],
  },
  {
    night: 7,
    date: "11 JUN",
    dateKey: "2026-06-11",
    day: "(RESCHEDULED) THURS",
    time: "18:00",
    courts: [
      { court: 1, homeTeam: "SMASH BROS GC", awayTeam: "LOS TOROS" },
      { court: 2, homeTeam: "VIBORA RAPTORS", awayTeam: "SMASH MASTERS" },
    ],
    sittingOut: ["TOKOLOSHE", "ACE DEUCE"],
  },
  {
    night: 6,
    date: "14 JUN",
    dateKey: "2026-06-14",
    day: "SUN",
    time: "18:00",
    courts: [
      { court: 1, homeTeam: "SMASH MASTERS", awayTeam: "TOKOLOSHE" },
      { court: 2, homeTeam: "VIBORA RAPTORS", awayTeam: "ACE DEUCE" },
    ],
    sittingOut: ["SMASH BROS GC", "LOS TOROS"],
  },
  {
    night: 8,
    date: "19 JUN",
    dateKey: "2026-06-19",
    day: "FRI",
    time: "18:00",
    courts: [
      { court: 1, homeTeam: "TOKOLOSHE", awayTeam: "SMASH BROS GC" },
      { court: 2, homeTeam: "SMASH MASTERS", awayTeam: "LOS TOROS" },
    ],
    sittingOut: ["VIBORA RAPTORS", "ACE DEUCE"],
  },
]

interface ChampionshipMatch {
  id: string
  label: string
  homeTeam: string
  awayTeam: string
  description?: string
}

interface ChampionshipRound {
  name: string
  date: string
  dateKey: string
  day: string
  time: string
  matches: ChampionshipMatch[]
  sittingOut: string[]
}

// Official DPL Season 4 Championship Phase Schedule
const championshipPhaseData: ChampionshipRound[] = [
  {
    name: "QUALIFIER",
    date: "20 JUN",
    dateKey: "2026-06-20",
    day: "SAT",
    time: "18:00",
    matches: [
      { id: "Q1", label: "Q1", homeTeam: "POS 1", awayTeam: "POS 2" },
    ],
    sittingOut: ["POS 3", "POS 4", "POS 5", "POS 6"],
  },
  {
    name: "ELIMINATOR",
    date: "24 JUN",
    dateKey: "2026-06-24",
    day: "WED",
    time: "18:00",
    matches: [
      { id: "E1", label: "E1", homeTeam: "POS 3", awayTeam: "POS 4" },
      { id: "E2", label: "E2", homeTeam: "POS 5", awayTeam: "POS 6" },
    ],
    sittingOut: ["POS 1", "POS 2"],
  },
  {
    name: "SEMIFINAL",
    date: "26 JUN",
    dateKey: "2026-06-26",
    day: "FRI",
    time: "18:00",
    matches: [
      { id: "S1", label: "S1", homeTeam: "WIN Q1", awayTeam: "WIN E1" },
      { id: "S2", label: "S2", homeTeam: "LOSER Q1", awayTeam: "WIN E2" },
    ],
    sittingOut: ["LOSER E1", "LOSER E2"],
  },
  {
    name: "GRAND FINALS",
    date: "27 JUN",
    dateKey: "2026-06-27",
    day: "SAT",
    time: "18:00",
    matches: [
      { id: "F", label: "FINAL", homeTeam: "WIN S1", awayTeam: "WIN S2", description: "Championship Match" },
      { id: "3RD", label: "3RD PLACE", homeTeam: "LOSER S1", awayTeam: "LOSER S2", description: "Bronze Match" },
      { id: "5TH", label: "5TH/6TH", homeTeam: "LOSER E1", awayTeam: "LOSER E2", description: "5th/6th Playoff" },
    ],
    sittingOut: [],
  },
]

const streamLinks = [
  { court: "Court 1", href: "https://www.youtube.com/@DPLBOTSWANA" },
  { court: "Court 2", href: "https://www.youtube.com/@dplcourt2" },
]

function hasScheduleEnded(dateKey: string) {
  const endOfMatchDate = new Date(`${dateKey}T23:59:59+02:00`)
  return Date.now() > endOfMatchDate.getTime()
}

function getInitialLeagueNight() {
  return leaguePhaseData.find((matchNight) => !hasScheduleEnded(matchNight.dateKey))?.night ?? leaguePhaseData.at(-1)?.night ?? null
}

function getInitialChampionshipRound() {
  return championshipPhaseData.find((round) => !hasScheduleEnded(round.dateKey))?.name ?? championshipPhaseData.at(-1)?.name ?? null
}

function StreamLinks() {
  return (
    <div className="rounded-xl p-3 bg-zinc-900/50 ring-1 ring-white/[0.04]">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Youtube className="h-3.5 w-3.5 text-primary/70" />
        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/80">
          Live Streams
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {streamLinks.map((stream) => (
          <a
            key={stream.court}
            href={stream.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-lg bg-zinc-800/40 px-2.5 py-2 text-[10px] font-semibold text-foreground ring-1 ring-white/[0.05] transition-colors hover:bg-white/[0.05] hover:text-primary"
          >
            <span>{stream.court}</span>
            <ExternalLink className="h-3 w-3 text-primary/70" />
          </a>
        ))}
      </div>
    </div>
  )
}

function TeamLogo({ team, size = "md" }: { team: string; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const logo = teamLogos[team]

  if (!logo) {
    return (
      <div className={`${sizeClasses[size]} rounded-lg bg-zinc-800/80 ring-1 ring-white/[0.08] flex items-center justify-center`}>
        <span className="text-[8px] font-bold text-muted-foreground">{team.substring(0, 3)}</span>
      </div>
    )
  }

  return (
    <div className={`relative ${sizeClasses[size]} rounded-lg bg-zinc-900/80 ring-1 ring-white/[0.08] overflow-hidden`}>
      <img
        src={logo}
        alt={team}
        loading="lazy"
        decoding="async"
        className="object-contain p-0.5 w-full h-full"
      />
    </div>
  )
}

function MatchCard({ homeTeam, awayTeam, court, ended = false }: { homeTeam: string | null; awayTeam: string | null; court?: number; ended?: boolean }) {
  if (!homeTeam || !awayTeam) {
    return (
      <div className={`rounded-xl p-3 bg-zinc-800/20 ring-1 ring-white/[0.03] ${ended ? "opacity-55" : ""}`}>
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin className="h-3 w-3 text-muted-foreground/40" />
          <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Court {court}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-center py-4">No Match</p>
      </div>
    )
  }

  return (
    <div className={`rounded-xl p-3 bg-zinc-800/30 ring-1 ring-white/[0.04] ${ended ? "opacity-60" : ""}`}>
      {court && (
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-primary/60" />
            <span className="text-[9px] font-semibold uppercase tracking-widest text-primary/70">
              Court {court}
            </span>
          </div>
          {ended && (
            <span className="rounded-md bg-zinc-800/70 px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-widest text-muted-foreground ring-1 ring-white/[0.05]">
              Ended
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamLogo team={homeTeam} size="md" />
          <span className={`text-[9px] font-semibold text-foreground text-center leading-tight max-w-[70px] ${ended ? "line-through decoration-primary/60" : ""}`}>
            {homeTeam}
          </span>
        </div>

        <div className="flex flex-col items-center px-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
            <span className="text-[9px] font-bold text-primary">VS</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamLogo team={awayTeam} size="md" />
          <span className={`text-[9px] font-semibold text-foreground text-center leading-tight max-w-[70px] ${ended ? "line-through decoration-primary/60" : ""}`}>
            {awayTeam}
          </span>
        </div>
      </div>
    </div>
  )
}

function SittingOutBadges({ teams }: { teams: string[] }) {
  if (teams.length === 0) return null

  return (
    <div className="rounded-xl p-2.5 bg-zinc-800/20 ring-1 ring-white/[0.03]">
      <div className="flex items-center gap-1.5 mb-2">
        <Users className="h-2.5 w-2.5 text-muted-foreground/50" />
        <span className="text-[8px] uppercase tracking-widest text-muted-foreground/70 font-semibold">
          Sitting Out
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {teams.map((team) => (
          <div key={team} className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-800/50 ring-1 ring-white/[0.04]">
            {teamLogos[team] ? (
              <TeamLogo team={team} size="sm" />
            ) : (
              <div className="h-4 w-4 rounded bg-zinc-700/50 flex items-center justify-center">
                <span className="text-[6px] font-bold text-muted-foreground">{team.substring(0, 2)}</span>
              </div>
            )}
            <span className="text-[7px] font-medium text-muted-foreground">
              {team.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export const ScheduleSection = memo(function ScheduleSectionComponent() {
  const [expandedNight, setExpandedNight] = useState<number | null>(getInitialLeagueNight)
  const [expandedChampionship, setExpandedChampionship] = useState<string | null>(getInitialChampionshipRound)
  const [activePhase, setActivePhase] = useState<"league" | "championship">("league")

  useEffect(() => {
    if (activePhase === "league" && expandedNight != null) {
      const currentNight = leaguePhaseData.find((matchNight) => matchNight.night === expandedNight)
      if (currentNight && hasScheduleEnded(currentNight.dateKey)) {
        setExpandedNight(getInitialLeagueNight())
      }
    }
    if (activePhase === "championship" && expandedChampionship != null) {
      const currentRound = championshipPhaseData.find((round) => round.name === expandedChampionship)
      if (currentRound && hasScheduleEnded(currentRound.dateKey)) {
        setExpandedChampionship(getInitialChampionshipRound())
      }
    }
  }, [activePhase, expandedNight, expandedChampionship])

  return (
    <SectionCard
      title="Schedule"
      icon={<Calendar className="h-3.5 w-3.5 text-primary/70" />}
    >
      <div className="space-y-4">
        {/* Phase Toggle */}
        <div className="flex gap-1 p-1 bg-zinc-900/50 rounded-xl ring-1 ring-white/[0.04]">
          <button
            onClick={() => setActivePhase("league")}
            className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all duration-150 ${
              activePhase === "league"
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
            }`}
          >
            League Phase
          </button>
          <button
            onClick={() => setActivePhase("championship")}
            className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all duration-150 ${
              activePhase === "championship"
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
            }`}
          >
            Championship
          </button>
        </div>

        <StreamLinks />

        {/* League Phase */}
        {activePhase === "league" && (
          <div className="space-y-2.5">
            <div className="text-center mb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                League Phase
              </h3>
              <p className="text-[9px] text-muted-foreground mt-0.5">8 Match Nights | 27 May - 19 Jun</p>
            </div>

            {leaguePhaseData.map((matchNight) => {
              const ended = hasScheduleEnded(matchNight.dateKey)

              return (
              <div
                key={matchNight.night}
                className={`rounded-2xl overflow-hidden ring-1 ring-white/[0.06] bg-zinc-900/40 ${ended ? "opacity-75" : ""}`}
              >
                <button
                  onClick={() => setExpandedNight(expandedNight === matchNight.night ? null : matchNight.night)}
                  className="w-full px-3 py-2.5 flex items-center justify-between bg-gradient-to-r from-primary/8 via-primary/4 to-transparent hover:from-primary/12 transition-all duration-200"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/20 ring-1 ring-primary/30">
                      <span className="text-[10px] font-bold text-primary">{matchNight.night}</span>
                    </div>
                    <div className="text-left">
                      <p className={`text-[10px] font-bold text-foreground uppercase tracking-wide ${ended ? "line-through decoration-primary/60" : ""}`}>
                        Night {matchNight.night}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {matchNight.day} {matchNight.date} | {matchNight.time}
                      </p>
                    </div>
                  </div>
                  {ended && (
                    <span className="mr-2 rounded-md bg-zinc-800/70 px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-widest text-muted-foreground ring-1 ring-white/[0.05]">
                      Ended
                    </span>
                  )}
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expandedNight === matchNight.night ? "rotate-180" : ""}`} />
                </button>

                {expandedNight === matchNight.night && (
                  <div className="px-2.5 pb-2.5 space-y-2">
                    {matchNight.courts.map((court) => (
                      <MatchCard
                        key={court.court}
                        homeTeam={court.homeTeam}
                        awayTeam={court.awayTeam}
                        court={court.court}
                        ended={ended}
                      />
                    ))}
                    <SittingOutBadges teams={matchNight.sittingOut} />
                  </div>
                )}
              </div>
              )
            })}
          </div>
        )}

        {/* Championship Phase */}
        {activePhase === "championship" && (
          <div className="space-y-2.5">
            <div className="text-center mb-3">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Trophy className="h-3.5 w-3.5 text-primary" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                  Championship Phase
                </h3>
              </div>
              <p className="text-[9px] text-muted-foreground">Finals Week | 20 - 27 Jun</p>
            </div>

            {championshipPhaseData.map((round) => {
              const ended = hasScheduleEnded(round.dateKey)

              return (
              <div
                key={round.name}
                className={`rounded-2xl overflow-hidden ring-1 ring-white/[0.06] bg-zinc-900/40 ${ended ? "opacity-75" : ""}`}
              >
                <button
                  onClick={() => setExpandedChampionship(expandedChampionship === round.name ? null : round.name)}
                  className={`w-full px-3 py-2.5 flex items-center justify-between transition-all duration-200 ${
                    round.name === "GRAND FINALS"
                      ? "bg-gradient-to-r from-primary/20 via-primary/10 to-transparent hover:from-primary/25"
                      : "bg-gradient-to-r from-primary/8 via-primary/4 to-transparent hover:from-primary/12"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`flex items-center justify-center h-7 px-2 rounded-lg ring-1 ${
                      round.name === "GRAND FINALS"
                        ? "bg-primary/30 ring-primary/50"
                        : "bg-primary/20 ring-primary/30"
                    }`}>
                      <span className={`text-[8px] font-bold uppercase tracking-wider ${
                        round.name === "GRAND FINALS" ? "text-primary" : "text-primary/90"
                      }`}>
                        {round.name === "GRAND FINALS" ? "FINALS" : round.name.substring(0, 4)}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className={`text-[10px] font-bold text-foreground uppercase tracking-wide ${ended ? "line-through decoration-primary/60" : ""}`}>
                        {round.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {round.day} {round.date} | {round.time}
                      </p>
                    </div>
                  </div>
                  {ended && (
                    <span className="mr-2 rounded-md bg-zinc-800/70 px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-widest text-muted-foreground ring-1 ring-white/[0.05]">
                      Ended
                    </span>
                  )}
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expandedChampionship === round.name ? "rotate-180" : ""}`} />
                </button>

                {expandedChampionship === round.name && (
                  <div className="px-2.5 pb-2.5 space-y-2">
                    {round.matches.map((match) => (
                      <div key={match.id} className={`rounded-xl p-3 bg-zinc-800/30 ring-1 ring-white/[0.04] ${ended ? "opacity-60" : ""}`}>
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <div className={`px-1.5 py-0.5 rounded ${
                            match.label === "FINAL"
                              ? "bg-primary/25 ring-1 ring-primary/40"
                              : "bg-zinc-700/50"
                          }`}>
                            <span className={`text-[8px] font-bold uppercase tracking-wider ${
                              match.label === "FINAL" ? "text-primary" : "text-muted-foreground"
                            }`}>
                              {match.label}
                            </span>
                          </div>
                          {match.description && (
                            <span className="text-[8px] text-muted-foreground/70">{match.description}</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-col items-center gap-1.5 flex-1">
                            <TeamLogo team={match.homeTeam} size="md" />
                            <span className={`text-[9px] font-semibold text-foreground text-center ${ended ? "line-through decoration-primary/60" : ""}`}>
                              {match.homeTeam}
                            </span>
                          </div>

                          <div className="flex flex-col items-center px-2">
                            <div className={`h-7 w-7 rounded-full flex items-center justify-center ${
                              match.label === "FINAL"
                                ? "bg-primary/20 ring-1 ring-primary/40"
                                : "bg-primary/10 ring-1 ring-primary/20"
                            }`}>
                              <span className="text-[9px] font-bold text-primary">VS</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-center gap-1.5 flex-1">
                            <TeamLogo team={match.awayTeam} size="md" />
                            <span className={`text-[9px] font-semibold text-foreground text-center ${ended ? "line-through decoration-primary/60" : ""}`}>
                              {match.awayTeam}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <SittingOutBadges teams={round.sittingOut} />
                  </div>
                )}
              </div>
              )
            })}

            {/* Awards Note */}
            <div className="rounded-xl p-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent ring-1 ring-primary/20">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-[10px] font-bold text-foreground">Awards Ceremony</p>
                  <p className="text-[8px] text-muted-foreground">SAT 27 JUN - Following Grand Finals</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
})
