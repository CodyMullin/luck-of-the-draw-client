import { useState, useEffect, useRef } from "react";
import {
  useCurrentRound,
  useRoundResult,
  useScoreboard,
  useSendMessage,
  useWrongAnswers,
  useGamePhase,
  useSuddenDeathPlayers,
  useGameState,
} from "../game/GameContext.tsx";
import { usePlayerSearch } from "../game/usePlayerSearch.ts";
import { Scoreboard } from "./Scoreboard.tsx";

export function GameView() {
  const phase = useGamePhase();
  const roundResult = useRoundResult();

  if (phase === "round_result" && roundResult) {
    return <RoundResultView />;
  }

  return <ActiveRoundView />;
}

function ActiveRoundView() {
  const round = useCurrentRound();
  const send = useSendMessage();
  const wrongAnswers = useWrongAnswers();
  const scoreboard = useScoreboard();
  const phase = useGamePhase();
  const suddenDeathPlayers = useSuddenDeathPlayers();
  const state = useGameState();
  const { query, setQuery, results, loading, reset } = usePlayerSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [round]);

  if (!round) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="font-display text-lg text-dirt/60">Waiting for next round...</p>
      </div>
    );
  }

  const isSuddenDeath = phase === "sudden_death";
  const canAnswer = !isSuddenDeath || suddenDeathPlayers.includes(state.playerName);

  function handleSelectPlayer(playerID: string) {
    send({ type: "answer:submit", playerID });
    reset();
    inputRef.current?.focus();
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 pt-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Round info */}
        <div className="text-center">
          <div className="font-display text-sm uppercase tracking-wider text-dirt/60">
            {isSuddenDeath ? "Sudden Death" : `Round ${round.roundNumber} of ${round.totalRounds}`}
          </div>
          <RoundTimer timeLimit={round.timeLimit} />
        </div>

        {/* Question */}
        <div className="rounded-lg border-2 border-scoreboard bg-scoreboard p-6 text-center shadow-lg">
          <p className="font-display text-sm uppercase tracking-wider text-scoreboard-text/60">
            Name a player
          </p>
          <div className="mt-2 space-y-1">
            <p className="font-display text-2xl font-bold text-scoreboard-text">
              {round.position}
            </p>
            <p className="font-display text-xl text-scoreboard-text">{round.teamName}</p>
            <p className="font-display text-xl text-scoreboard-text">{round.year}</p>
          </div>
        </div>

        {/* Search */}
        {canAnswer ? (
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a player..."
              className="w-full rounded-lg border-2 border-leather/30 bg-cream-dark px-4 py-3 font-display text-dirt placeholder:text-dirt/40 focus:border-leather focus:outline-none"
              autoComplete="off"
            />
            {loading && (
              <div className="absolute top-3.5 right-3 font-display text-xs text-dirt/40">
                ...
              </div>
            )}

            {/* Results dropdown */}
            {results.length > 0 && (
              <ul className="absolute right-0 left-0 z-10 mt-1 max-h-60 overflow-auto rounded-lg border-2 border-leather/30 bg-cream shadow-lg">
                {results.map((p) => {
                  const isWrong = wrongAnswers.includes(p.playerID);
                  return (
                    <li key={p.playerID}>
                      <button
                        onClick={() => handleSelectPlayer(p.playerID)}
                        disabled={isWrong}
                        className={`w-full px-4 py-2 text-left font-display transition-colors ${
                          isWrong
                            ? "cursor-not-allowed text-dirt/30 line-through"
                            : "text-dirt hover:bg-cream-dark"
                        }`}
                      >
                        {p.nameFirst} {p.nameLast}
                        {isWrong && (
                          <span className="ml-2 text-xs text-error">Wrong</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <p className="text-center font-display text-dirt/60">
            Waiting for sudden death players...
          </p>
        )}

        {/* Wrong answers count */}
        {wrongAnswers.length > 0 && (
          <p className="text-center font-display text-sm text-error">
            {wrongAnswers.length} wrong {wrongAnswers.length === 1 ? "guess" : "guesses"}
          </p>
        )}

        {/* Mini scoreboard */}
        <Scoreboard entries={scoreboard} compact />
      </div>
    </div>
  );
}

function RoundResultView() {
  const result = useRoundResult()!;
  const scoreboard = useScoreboard();
  const [countdown, setCountdown] = useState(result.nextRoundIn);

  useEffect(() => {
    setCountdown(result.nextRoundIn);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [result]);

  return (
    <div className="flex min-h-screen flex-col items-center px-4 pt-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="font-display text-sm uppercase tracking-wider text-dirt/60">
            Round {result.roundNumber} Result
          </div>
          {countdown > 0 && (
            <div className="mt-1 font-display text-sm text-dirt/40">
              Next round in {countdown}s
            </div>
          )}
        </div>

        {/* Winner */}
        <div className="rounded-lg border-2 border-scoreboard bg-scoreboard p-6 text-center">
          {result.winnerName ? (
            <>
              <p className="font-display text-sm uppercase tracking-wider text-scoreboard-text/60">
                Winner
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-gold">
                {result.winnerName}
              </p>
            </>
          ) : (
            <p className="font-display text-xl text-scoreboard-text/60">Time's up! No winner.</p>
          )}
        </div>

        {/* Valid answers */}
        <div className="rounded-lg border-2 border-leather/30 bg-cream-dark p-4">
          <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-leather">
            Valid Answers ({result.validPlayerCount})
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.validPlayers.map((p) => (
              <span
                key={p.playerID}
                className="rounded bg-grass/10 px-2 py-1 font-display text-sm text-grass"
              >
                {p.nameFirst} {p.nameLast}
              </span>
            ))}
          </div>
        </div>

        {/* Scoreboard */}
        <Scoreboard entries={scoreboard} />
      </div>
    </div>
  );
}

function RoundTimer({ timeLimit }: { timeLimit: number }) {
  const [remaining, setRemaining] = useState(timeLimit);

  useEffect(() => {
    setRemaining(timeLimit);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLimit]);

  const isUrgent = remaining <= 5;

  return (
    <div
      className={`mt-2 font-display text-4xl font-bold ${
        isUrgent ? "animate-pulse text-error" : "text-leather"
      }`}
    >
      {remaining}s
    </div>
  );
}
