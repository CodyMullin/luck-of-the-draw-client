import type { ScoreEntry } from "../game/schema.ts";

export function Scoreboard({
  entries,
  compact = false,
}: {
  entries: ReadonlyArray<ScoreEntry>;
  compact?: boolean;
}) {
  const sorted = [...entries].sort((a, b) => b.score - a.score);

  return (
    <div className={`rounded-lg border-2 border-leather/30 bg-cream-dark ${compact ? "p-3" : "p-4"}`}>
      <h3
        className={`font-display font-bold uppercase tracking-wider text-leather ${compact ? "mb-2 text-xs" : "mb-3 text-sm"}`}
      >
        Scoreboard
      </h3>
      <div className="space-y-1">
        {sorted.map((entry, i) => (
          <div
            key={entry.displayName}
            className={`flex items-center justify-between font-display ${compact ? "text-sm" : ""}`}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 text-right text-dirt/40">{i + 1}.</span>
              <span className="text-dirt">{entry.displayName}</span>
            </div>
            <span className="font-bold text-leather">{entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
