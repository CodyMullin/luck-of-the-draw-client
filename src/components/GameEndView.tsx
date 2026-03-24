import { useScoreboard, useGamePhase, useSuddenDeathPlayers } from "../game/GameContext.tsx";
import { Scoreboard } from "./Scoreboard.tsx";
import { useNavigate } from "@tanstack/react-router";

export function GameEndView() {
  const scoreboard = useScoreboard();
  const phase = useGamePhase();
  const suddenDeathPlayers = useSuddenDeathPlayers();
  const navigate = useNavigate();
  const sorted = [...scoreboard].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  if (phase === "sudden_death") {
    return (
      <div className="flex min-h-screen flex-col items-center px-4 pt-8">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-error">Sudden Death!</h1>
            <p className="mt-2 font-display text-dirt/60">
              Tied players: {suddenDeathPlayers.join(", ")}
            </p>
          </div>
          <Scoreboard entries={scoreboard} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 pt-8">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-leather">Game Over</h1>
        </div>

        {/* Winner highlight */}
        {winner && (
          <div className="rounded-lg border-2 border-gold bg-scoreboard p-6 text-center shadow-lg">
            <p className="font-display text-sm uppercase tracking-wider text-scoreboard-text/60">
              Champion
            </p>
            <p className="mt-1 font-display text-4xl font-bold text-gold">
              {winner.displayName}
            </p>
            <p className="mt-1 font-display text-lg text-scoreboard-text">
              {winner.score} {winner.score === 1 ? "point" : "points"}
            </p>
          </div>
        )}

        {/* Full scoreboard */}
        <Scoreboard entries={scoreboard} />

        {/* Play again */}
        <button
          onClick={() => navigate({ to: "/" })}
          className="w-full rounded-lg border-2 border-leather bg-leather px-4 py-3 font-display text-lg font-bold uppercase tracking-wider text-chalk transition-colors hover:bg-leather-light"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
