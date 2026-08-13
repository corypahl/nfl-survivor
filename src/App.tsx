import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Info,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trophy,
} from "lucide-react";
import { games, type ScheduledGame } from "./data/games";
import { teams, type Team } from "./data/teams";

const weeks = Array.from({ length: 18 }, (_, index) => index + 1);
const teamsByCode = new Map(teams.map((team) => [team.code, team]));
const schedule = new Map<string, ScheduledGame>();

for (const game of games) {
  schedule.set(`${game.away}-${game.week}`, game);
  schedule.set(`${game.home}-${game.week}`, game);
}

function getGame(teamCode: string, week: number) {
  return schedule.get(`${teamCode}-${week}`);
}

function getOpponent(teamCode: string, game: ScheduledGame) {
  return teamsByCode.get(game.away === teamCode ? game.home : game.away)!;
}

function estimatedWinProbability(team: Team, game: ScheduledGame) {
  const opponent = getOpponent(team.code, game);
  const teamRating = 1700 - (team.rank - 1) * 10;
  const opponentRating = 1700 - (opponent.rank - 1) * 10;
  const venueAdjustment = game.home === team.code ? 35 : -35;
  const probability = 1 / (1 + 10 ** (-(teamRating - opponentRating + venueAdjustment) / 400));

  return Math.round(probability * 100);
}

function probabilityBand(probability: number) {
  if (probability >= 65) return "strong";
  if (probability >= 55) return "lean";
  return "risk";
}

function GameCell({ team, week, focused }: { team: Team; week: number; focused: boolean }) {
  const game = getGame(team.code, week);

  if (!game) {
    return (
      <td className={`game-cell bye-cell ${focused ? "active-week" : ""}`} data-week={week}>
        <span className="bye-label">BYE</span>
        <span className="bye-dash" />
      </td>
    );
  }

  const opponent = getOpponent(team.code, game);
  const probability = estimatedWinProbability(team, game);
  const isHome = game.home === team.code;
  const band = probabilityBand(probability);
  const teamLabel = `${team.city} ${team.name}`;
  const opponentLabel = `${opponent.city} ${opponent.name}`;

  return (
    <td
      className={`game-cell probability-${band} ${focused ? "active-week" : ""}`}
      data-week={week}
      title={`${teamLabel} ${isHome ? "vs." : "at"} ${opponentLabel} — ${probability}% planning estimate`}
    >
      <div className="matchup-line">
        <span className="venue">{isHome ? "vs" : "@"}</span>
        <span className="opponent-code">{opponent.code}</span>
      </div>
      <div className="probability-line">
        <span className="probability-value">{probability}%</span>
        <span className="probability-track" aria-hidden="true">
          <span style={{ width: `${probability}%` }} />
        </span>
      </div>
    </td>
  );
}

export default function App() {
  const [search, setSearch] = useState("");
  const [conference, setConference] = useState<"ALL" | "AFC" | "NFC">("ALL");
  const [focusStrong, setFocusStrong] = useState(false);
  const [activeWeek, setActiveWeek] = useState(1);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teams.filter((team) => {
      const matchesConference = conference === "ALL" || team.conference === conference;
      const matchesSearch =
        !query ||
        team.name.toLowerCase().includes(query) ||
        team.city.toLowerCase().includes(query) ||
        team.code.toLowerCase().includes(query);

      return matchesConference && matchesSearch;
    });
  }, [conference, search]);

  const bestOptions = useMemo(() => {
    return teams
      .map((team) => {
        const game = getGame(team.code, activeWeek);
        return game ? { team, game, probability: estimatedWinProbability(team, game) } : null;
      })
      .filter((option): option is NonNullable<typeof option> => Boolean(option))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);
  }, [activeWeek]);

  function moveToWeek(week: number) {
    const nextWeek = Math.min(18, Math.max(1, week));
    setActiveWeek(nextWeek);

    const scrollContainer = tableScrollRef.current;
    const target = scrollContainer?.querySelector<HTMLElement>(`thead [data-week="${nextWeek}"]`);
    if (scrollContainer && target) {
      scrollContainer.scrollTo({ left: Math.max(0, target.offsetLeft - 245), behavior: "smooth" });
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Survivor Board home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
          </span>
          <span>SURVIVOR BOARD</span>
        </a>
        <div className="season-chip">
          <span className="live-dot" />
          2026 SEASON
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <Trophy size={14} strokeWidth={2.5} />
              BUILT FOR TWO SURVIVOR ENTRIES
            </div>
            <h1>See the whole season.<br />Make the right pick.</h1>
            <p>
              A week-by-week view of every team, every opponent, and an initial win estimate—so you can spot safe paths without using your best teams too early.
            </p>
            <div className="hero-stats" aria-label="Season coverage">
              <div><strong>32</strong><span>teams ranked</span></div>
              <div><strong>18</strong><span>weeks mapped</span></div>
              <div><strong>272</strong><span>games loaded</span></div>
            </div>
          </div>

          <aside className="week-card" aria-label={`Top planning estimates for week ${activeWeek}`}>
            <div className="week-card-header">
              <div>
                <span className="card-kicker">WEEKLY SNAPSHOT</span>
                <h2>Week {activeWeek} leaders</h2>
              </div>
              <div className="week-steppers">
                <button onClick={() => moveToWeek(activeWeek - 1)} disabled={activeWeek === 1} aria-label="Previous week">
                  <ArrowLeft size={16} />
                </button>
                <button onClick={() => moveToWeek(activeWeek + 1)} disabled={activeWeek === 18} aria-label="Next week">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="leader-list">
              {bestOptions.map(({ team, game, probability }, index) => {
                const opponent = getOpponent(team.code, game);
                const isHome = game.home === team.code;
                return (
                  <div className="leader-row" key={team.code}>
                    <span className="leader-number">0{index + 1}</span>
                    <span className="team-token" style={{ backgroundColor: team.color }}>{team.code}</span>
                    <span className="leader-team">
                      <strong>{team.city} {team.name}</strong>
                      <small>{isHome ? "vs" : "at"} {opponent.city} {opponent.name}</small>
                    </span>
                    <span className="leader-probability">{probability}%</span>
                  </div>
                );
              })}
            </div>

            <p className="snapshot-note"><Sparkles size={14} />Rank-based planning estimates</p>
          </aside>
        </section>

        <section className="board-section" aria-labelledby="board-title">
          <div className="board-heading">
            <div>
              <span className="section-index">01 / SEASON BOARD</span>
              <h2 id="board-title">All matchups at a glance</h2>
              <p>Teams are ordered strongest to weakest by NFL.com’s post-draft power ranking.</p>
            </div>
            <div className="legend" aria-label="Win estimate legend">
              <span><i className="legend-dot strong" />65%+ Strong</span>
              <span><i className="legend-dot lean" />55–64% Lean</span>
              <span><i className="legend-dot risk" />Under 55% Risk</span>
            </div>
          </div>

          <div className="toolbar">
            <label className="search-control">
              <Search size={18} aria-hidden="true" />
              <span className="sr-only">Search teams</span>
              <input
                type="search"
                placeholder="Search a team"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <div className="conference-filter" aria-label="Filter by conference">
              {(["ALL", "AFC", "NFC"] as const).map((option) => (
                <button
                  key={option}
                  className={conference === option ? "selected" : ""}
                  onClick={() => setConference(option)}
                  aria-pressed={conference === option}
                >
                  {option === "ALL" ? "All teams" : option}
                </button>
              ))}
            </div>

            <button
              className={`focus-toggle ${focusStrong ? "selected" : ""}`}
              onClick={() => setFocusStrong((current) => !current)}
              aria-pressed={focusStrong}
            >
              <SlidersHorizontal size={17} />
              Focus 65%+
            </button>

            <div className="week-jump">
              <CalendarDays size={17} />
              <label htmlFor="week-select">Jump to</label>
              <select id="week-select" value={activeWeek} onChange={(event) => moveToWeek(Number(event.target.value))}>
                {weeks.map((week) => <option key={week} value={week}>Week {week}</option>)}
              </select>
            </div>
          </div>

          <div className={`table-frame ${focusStrong ? "focus-strong" : ""}`}>
            <div className="table-scroll" ref={tableScrollRef}>
              <table>
                <caption className="sr-only">2026 NFL survivor planning board with power rankings, opponents, and estimated win probabilities by week.</caption>
                <thead>
                  <tr>
                    <th className="team-header" scope="col">
                      <span>POWER RANK</span>
                      <strong>TEAM</strong>
                    </th>
                    {weeks.map((week) => (
                      <th key={week} scope="col" className={activeWeek === week ? "active-week" : ""} data-week={week}>
                        <button onClick={() => moveToWeek(week)} aria-label={`Focus week ${week}`}>
                          <span>WEEK</span>
                          <strong>{String(week).padStart(2, "0")}</strong>
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((team) => (
                    <tr key={team.code}>
                      <th className="team-cell" scope="row">
                        <div className="team-cell-inner">
                          <span className="rank-number">{String(team.rank).padStart(2, "0")}</span>
                          <span className="team-token" style={{ backgroundColor: team.color }}>{team.code}</span>
                          <span className="team-identity">
                            <strong>{team.city} <b>{team.name}</b></strong>
                            <small>{team.conference} {team.division}</small>
                          </span>
                        </div>
                      </th>
                      {weeks.map((week) => <GameCell key={week} team={team} week={week} focused={activeWeek === week} />)}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTeams.length === 0 && (
                <div className="empty-state">
                  <Search size={22} />
                  <strong>No teams found</strong>
                  <span>Try a city, nickname, or abbreviation.</span>
                </div>
              )}
            </div>
            <div className="scroll-hint" aria-hidden="true"><ArrowRight size={14} /> Scroll for later weeks</div>
          </div>
        </section>

        <section className="methodology" id="methodology">
          <div className="method-icon"><Info size={22} /></div>
          <div>
            <span className="section-index">ABOUT THE NUMBERS</span>
            <h2>A clear starting point, not a crystal ball.</h2>
          </div>
          <p>
            Estimates use team power rank, opponent rank, and a modest home-field adjustment. They are designed for early path planning—not as betting advice—and will become more useful when we add live odds, injuries, and your league rules.
          </p>
          <div className="source-links">
            <a href="https://www.nfl.com/schedules/2026/by-team" target="_blank" rel="noreferrer">Official schedule <ArrowRight size={14} /></a>
            <a href="https://www.nfl.com/news/nfl-power-rankings-post-2026-nfl-draft" target="_blank" rel="noreferrer">Ranking source <ArrowRight size={14} /></a>
          </div>
        </section>
      </main>

      <footer>
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark" aria-hidden="true"><span /><span /></span>
          <span>SURVIVOR BOARD</span>
        </a>
        <span>2026 planning edition</span>
        <span>Schedule updated August 2026</span>
      </footer>
    </div>
  );
}
