import {
  usePlayers,
  useSettings,
  useIsHost,
  useHost,
  useSendMessage,
  useGameState,
} from "../game/GameContext.tsx";
import { useToast } from "./Toaster.tsx";
import { useEffect, useRef } from "react";

export function LobbyView() {
  const state = useGameState();
  const players = usePlayers();
  const settings = useSettings();
  const isHost = useIsHost();
  const host = useHost();
  const send = useSendMessage();
  const toast = useToast();
  const prevHostRef = useRef(host);

  useEffect(() => {
    if (prevHostRef.current && prevHostRef.current !== host && host === state.playerName) {
      toast("You are now the host!", "success");
    }
    prevHostRef.current = host;
  }, [host, state.playerName, toast]);

  function handleStartGame() {
    send({ type: "game:start" });
  }

  function handleSettingChange(key: string, value: number) {
    send({
      type: "lobby:settings",
      settings: { [key]: value },
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-4 pt-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-leather">Lobby</h1>
          <div className="mt-2 inline-block rounded border-2 border-dashed border-leather/40 bg-cream-dark px-4 py-1 font-display text-2xl tracking-widest text-leather">
            {state.code}
          </div>
          <p className="mt-1 text-sm text-dirt/60">Share this code with friends</p>
        </div>

        {/* Players */}
        <div className="rounded-lg border-2 border-leather/30 bg-cream-dark p-4">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-leather">
            Players ({players.length})
          </h2>
          <ul className="space-y-1">
            {players.map((p) => (
              <li key={p} className="flex items-center gap-2 font-display text-dirt">
                <span className="inline-block h-2 w-2 rounded-full bg-grass" />
                {p}
                {p === host && (
                  <span className="rounded bg-leather/20 px-1.5 py-0.5 text-xs text-leather">
                    HOST
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Settings */}
        <div className="rounded-lg border-2 border-leather/30 bg-cream-dark p-4">
          <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-leather">
            Settings
          </h2>
          <div className="space-y-3">
            <SettingRow
              label="Year Range"
              disabled={!isHost}
            >
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.yearMin}
                  onChange={(e) => handleSettingChange("yearMin", Number(e.target.value))}
                  disabled={!isHost}
                  min={1871}
                  max={settings.yearMax}
                  className="w-20 rounded border border-leather/20 bg-cream px-2 py-1 text-center font-display text-sm text-dirt disabled:opacity-50"
                />
                <span className="text-dirt/60">to</span>
                <input
                  type="number"
                  value={settings.yearMax}
                  onChange={(e) => handleSettingChange("yearMax", Number(e.target.value))}
                  disabled={!isHost}
                  min={settings.yearMin}
                  max={2025}
                  className="w-20 rounded border border-leather/20 bg-cream px-2 py-1 text-center font-display text-sm text-dirt disabled:opacity-50"
                />
              </div>
            </SettingRow>

            <SettingRow label="Rounds" disabled={!isHost}>
              <input
                type="number"
                value={settings.rounds}
                onChange={(e) => handleSettingChange("rounds", Number(e.target.value))}
                disabled={!isHost}
                min={1}
                max={50}
                className="w-20 rounded border border-leather/20 bg-cream px-2 py-1 text-center font-display text-sm text-dirt disabled:opacity-50"
              />
            </SettingRow>

            <SettingRow label="Time Limit" disabled={!isHost}>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings.timeLimitSeconds}
                  onChange={(e) =>
                    handleSettingChange("timeLimitSeconds", Number(e.target.value))
                  }
                  disabled={!isHost}
                  min={5}
                  max={120}
                  className="w-20 rounded border border-leather/20 bg-cream px-2 py-1 text-center font-display text-sm text-dirt disabled:opacity-50"
                />
                <span className="text-sm text-dirt/60">seconds</span>
              </div>
            </SettingRow>
          </div>
        </div>

        {/* Start Button */}
        {isHost ? (
          <button
            onClick={handleStartGame}
            disabled={players.length < 1}
            className="w-full rounded-lg border-2 border-grass bg-grass px-4 py-3 font-display text-lg font-bold uppercase tracking-wider text-chalk transition-colors hover:bg-grass-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Game
          </button>
        ) : (
          <p className="text-center font-display text-dirt/60">
            Waiting for {host} to start the game...
          </p>
        )}
      </div>
    </div>
  );
}

function SettingRow({
  label,
  disabled,
  children,
}: {
  label: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className={`font-display text-sm text-dirt ${disabled ? "opacity-50" : ""}`}>
        {label}
      </label>
      {children}
    </div>
  );
}
