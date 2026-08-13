import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Cloud,
  CloudOff,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  LogOut,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import {
  confirmSignIn,
  getCurrentUser,
  signIn,
  signOut,
} from "aws-amplify/auth";
import { games, type ScheduledGame } from "./data/games";
import { teams, type Team } from "./data/teams";
import {
  awsConfigured,
  loadPicks,
  removePick,
  savePick,
  type Picks,
} from "./lib/aws";

const weeks = Array.from({ length: 18 }, (_, index) => index + 1);
const teamsByCode = new Map(teams.map((team) => [team.code, team]));
const schedule = new Map<string, ScheduledGame>();

for (const game of games) {
  schedule.set(`${game.away}-${game.week}`, game);
  schedule.set(`${game.home}-${game.week}`, game);
}

type AuthState = "checking" | "signed-out" | "new-password" | "signed-in" | "unconfigured";

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

type GameCellProps = {
  team: Team;
  week: number;
  focused: boolean;
  selected: boolean;
  usedInWeek?: number;
  saving: boolean;
  onPick: () => void;
};

function GameCell({ team, week, focused, selected, usedInWeek, saving, onPick }: GameCellProps) {
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
  const disabled = usedInWeek !== undefined && !selected;
  const teamLabel = `${team.city} ${team.name}`;
  const opponentLabel = `${opponent.city} ${opponent.name}`;
  const actionLabel = selected
    ? `Remove ${teamLabel} as the week ${week} pick`
    : disabled
      ? `${teamLabel} was already used in week ${usedInWeek}`
      : `Pick ${teamLabel} for week ${week}`;

  return (
    <td
      className={`game-cell probability-${band} ${focused ? "active-week" : ""} ${selected ? "selected-pick" : ""} ${disabled ? "used-team-game" : ""}`}
      data-week={week}
      title={`${teamLabel} ${isHome ? "vs." : "at"} ${opponentLabel} — ${probability}% planning estimate`}
    >
      <button className="game-cell-button" onClick={onPick} disabled={disabled || saving} aria-label={actionLabel}>
        {selected && <span className="pick-check"><Check size={11} strokeWidth={3} /> PICK</span>}
        {saving && <LoaderCircle className="spin cell-loader" size={15} />}
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
      </button>
    </td>
  );
}

export default function App() {
  const [search, setSearch] = useState("");
  const [focusStrong, setFocusStrong] = useState(false);
  const [activeWeek, setActiveWeek] = useState(1);
  const [authState, setAuthState] = useState<AuthState>(awsConfigured ? "checking" : "unconfigured");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [picks, setPicks] = useState<Picks>({});
  const [picksLoading, setPicksLoading] = useState(awsConfigured);
  const [savingKey, setSavingKey] = useState("");
  const [notice, setNotice] = useState("");
  const tableScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!awsConfigured) return;

    void getCurrentUser()
      .then(() => {
        setPicksLoading(true);
        setAuthState("signed-in");
      })
      .catch(() => setAuthState("signed-out"));
  }, []);

  useEffect(() => {
    if (authState !== "signed-in") return;

    let active = true;
    void loadPicks()
      .then((loaded) => {
        if (active) setPicks(loaded);
      })
      .catch((error: unknown) => {
        if (active) setNotice(error instanceof Error ? error.message : "Could not load picks.");
      })
      .finally(() => {
        if (active) setPicksLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authState]);

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return teams
      .filter((team) =>
        !query ||
        team.name.toLowerCase().includes(query) ||
        team.city.toLowerCase().includes(query) ||
        team.code.toLowerCase().includes(query),
      )
      .sort((left, right) => {
        const leftGame = getGame(left.code, activeWeek);
        const rightGame = getGame(right.code, activeWeek);
        const leftProbability = leftGame ? estimatedWinProbability(left, leftGame) : -1;
        const rightProbability = rightGame ? estimatedWinProbability(right, rightGame) : -1;

        return rightProbability - leftProbability || left.rank - right.rank;
      });
  }, [activeWeek, search]);

  const pickedWeekByTeam = useMemo(() => {
    return Object.fromEntries(
      Object.entries(picks).map(([week, teamCode]) => [teamCode, Number(week)]),
    ) as Record<string, number>;
  }, [picks]);

  function moveToWeek(week: number) {
    const nextWeek = Math.min(18, Math.max(1, week));
    setActiveWeek(nextWeek);

    const scrollContainer = tableScrollRef.current;
    const target = scrollContainer?.querySelector<HTMLElement>(`thead [data-week="${nextWeek}"]`);
    if (scrollContainer && target) {
      scrollContainer.scrollTo({ left: Math.max(0, target.offsetLeft - 245), behavior: "smooth" });
    }
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError("");

    try {
      if (authState === "new-password") {
        const result = await confirmSignIn({ challengeResponse: newPassword });
        if (!result.isSignedIn) throw new Error("The password update could not be completed.");
      } else {
        const result = await signIn({ username: email, password });
        if (result.nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
          setAuthState("new-password");
          return;
        }
        if (!result.isSignedIn) throw new Error("This sign-in needs an unsupported confirmation step.");
      }

      setPicksLoading(true);
      setAuthState("signed-in");
      setAccountOpen(false);
      setPassword("");
      setNewPassword("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Sign-in failed.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    setPicks({});
    setPicksLoading(false);
    setAuthState("signed-out");
    setAccountOpen(false);
  }

  async function handlePick(team: Team, week: number) {
    setActiveWeek(week);

    if (authState !== "signed-in") {
      setAccountOpen(true);
      return;
    }

    const selected = picks[week] === team.code;
    const key = `${week}-${team.code}`;
    setSavingKey(key);
    setNotice("");

    try {
      if (selected) {
        await removePick(week);
        setPicks((current) => {
          const nextPicks = { ...current };
          delete nextPicks[week];
          return nextPicks;
        });
        setNotice(`${team.name} removed from week ${week}.`);
      } else {
        await savePick(week, team.code);
        setPicks((current) => ({ ...current, [week]: team.code }));
        setNotice(`${team.name} saved for week ${week}.`);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The pick could not be saved.");
    } finally {
      setSavingKey("");
    }
  }

  const accountLabel = authState === "signed-in"
    ? picksLoading ? "Syncing picks" : "Picks synced"
    : authState === "checking" ? "Checking sign-in" : authState === "unconfigured" ? "Set up sync" : "Sign in";

  return (
    <main className="board-app">
      <section className={`table-frame ${focusStrong ? "focus-strong" : ""}`} aria-label="2026 survivor pick board">
        <div className="workspace-bar">
          <div className="compact-brand">
            <span className="brand-mark" aria-hidden="true"><span /><span /></span>
            <span>Survivor Board</span>
            <b>2026</b>
          </div>

          <div className="pick-count"><CheckCircle2 size={14} />{Object.keys(picks).length}<span>/ 18 picks</span></div>

          <button className={`account-button state-${authState}`} onClick={() => setAccountOpen(true)}>
            {authState === "signed-in" ? <Cloud size={15} /> : authState === "unconfigured" ? <CloudOff size={15} /> : <UserRound size={15} />}
            {accountLabel}
          </button>
        </div>

        <div className="toolbar">
          <label className="search-control">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search teams</span>
            <input
              type="search"
              placeholder="Search a team"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <button
            className={`focus-toggle ${focusStrong ? "selected" : ""}`}
            onClick={() => setFocusStrong((current) => !current)}
            aria-pressed={focusStrong}
          >
            <SlidersHorizontal size={16} />
            65%+
          </button>

          <div className="legend" aria-label="Win estimate legend">
            <span><i className="legend-dot strong" />65%+</span>
            <span><i className="legend-dot lean" />55–64%</span>
            <span><i className="legend-dot risk" />&lt;55%</span>
          </div>

          <div className="week-jump">
            <CalendarDays size={16} />
            <select aria-label="Jump to week" value={activeWeek} onChange={(event) => moveToWeek(Number(event.target.value))}>
              {weeks.map((week) => <option key={week} value={week}>Week {week}</option>)}
            </select>
          </div>
        </div>

        <div className="table-scroll" ref={tableScrollRef}>
          <table>
            <caption className="sr-only">2026 NFL survivor planning board. Select a matchup cell to save that team as the pick for the week.</caption>
            <thead>
              <tr>
                <th className="team-header" scope="col">
                  <span>WEEK {String(activeWeek).padStart(2, "0")} WIN % ↓</span>
                  <strong>TEAM</strong>
                </th>
                {weeks.map((week) => (
                  <th key={week} scope="col" className={activeWeek === week ? "active-week" : ""} data-week={week}>
                    <button onClick={() => moveToWeek(week)} aria-label={`Focus week ${week}`}>
                      <span>WEEK</span>
                      <strong>{String(week).padStart(2, "0")}</strong>
                      {picks[week] && <i className="week-picked-dot" />}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team) => {
                const pickedWeek = pickedWeekByTeam[team.code];
                return (
                  <tr key={team.code} className={pickedWeek ? "used-team-row" : ""}>
                    <th className="team-cell" scope="row">
                      <div className="team-cell-inner">
                        <span className="rank-number" title={`Power rank ${team.rank}`}>#{String(team.rank).padStart(2, "0")}</span>
                        <span className="team-token" style={{ backgroundColor: team.color }}>{team.code}</span>
                        <span className="team-identity">
                          <strong>{team.city} <b>{team.name}</b></strong>
                          {pickedWeek && <small><CheckCircle2 size={10} /> Used week {pickedWeek}</small>}
                        </span>
                      </div>
                    </th>
                    {weeks.map((week) => (
                      <GameCell
                        key={week}
                        team={team}
                        week={week}
                        focused={activeWeek === week}
                        selected={picks[week] === team.code}
                        usedInWeek={pickedWeek}
                        saving={savingKey === `${week}-${team.code}`}
                        onPick={() => void handlePick(team, week)}
                      />
                    ))}
                  </tr>
                );
              })}
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
      </section>

      {notice && (
        <div className="notice" role="status">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss"><X size={14} /></button>
        </div>
      )}

      {accountOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setAccountOpen(false)}>
          <section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="account-title">
            <button className="modal-close" onClick={() => setAccountOpen(false)} aria-label="Close"><X size={18} /></button>

            {authState === "unconfigured" ? (
              <>
                <div className="modal-icon"><CloudOff size={22} /></div>
                <p className="modal-kicker">ONE-TIME SETUP</p>
                <h2 id="account-title">Connect pick sync</h2>
                <p>The board is ready for DynamoDB. Deploy the included AWS stack and add its four public outputs to the GitHub repository variables.</p>
                <div className="setup-list">
                  <span><b>1</b> Deploy <code>infra/cloudformation.yml</code></span>
                  <span><b>2</b> Create your private Cognito user</span>
                  <span><b>3</b> Add the stack outputs to GitHub variables</span>
                </div>
                <p className="modal-footnote"><LockKeyhole size={14} />AWS credentials are never stored in this site.</p>
              </>
            ) : authState === "signed-in" ? (
              <>
                <div className="modal-icon success"><Cloud size={22} /></div>
                <p className="modal-kicker">PRIVATE SYNC</p>
                <h2 id="account-title">Your picks are synced</h2>
                <p>Your pick history is saved in DynamoDB and available anywhere you sign in.</p>
                <div className="pick-summary"><b>{Object.keys(picks).length}</b><span>of 18 weeks selected</span></div>
                <button className="primary-action secondary" onClick={() => void handleSignOut()}><LogOut size={16} /> Sign out</button>
              </>
            ) : (
              <>
                <div className="modal-icon"><LockKeyhole size={22} /></div>
                <p className="modal-kicker">PRIVATE BOARD</p>
                <h2 id="account-title">{authState === "new-password" ? "Choose your password" : "Sign in to sync picks"}</h2>
                <p>{authState === "new-password" ? "Your temporary password worked. Set the permanent password you’ll use from now on." : "Only your invited Cognito account can read or change these picks."}</p>
                <form onSubmit={(event) => void handleAuth(event)}>
                  {authState !== "new-password" ? (
                    <>
                      <label>Email<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
                      <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
                    </>
                  ) : (
                    <label>New password<input type="password" autoComplete="new-password" minLength={12} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
                  )}
                  {authError && <p className="auth-error">{authError}</p>}
                  <button className="primary-action" type="submit" disabled={authBusy}>
                    {authBusy ? <LoaderCircle className="spin" size={16} /> : <LogIn size={16} />}
                    {authState === "new-password" ? "Set password & sign in" : "Sign in"}
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
