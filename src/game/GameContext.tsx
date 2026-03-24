import { useEffect, useRef, useCallback, type ReactNode } from "react";
import { RegistryProvider, useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { Schema } from "effect";
import {
  gameStateAtom,
  phaseAtom,
  playersAtom,
  scoreboardAtom,
  settingsAtom,
  currentRoundAtom,
  roundResultAtom,
  hostAtom,
  isHostAtom,
  connectedAtom,
  wrongAnswersAtom,
  suddenDeathPlayersAtom,
  sendFnAtom,
} from "./atoms.ts";
import { createInitialState } from "./state.ts";
import type { GamePhase, GameState, RoundResult } from "./state.ts";
import { ServerMessage } from "./schema.ts";
import type { ClientMessage, ScoreEntry, ValidPlayer } from "./schema.ts";

const decodeMessage = Schema.decodeUnknownSync(ServerMessage);

export function GameProvider({
  code,
  playerName,
  children,
}: {
  code: string;
  playerName: string;
  children: ReactNode;
}) {
  return (
    <RegistryProvider>
      <GameConnection code={code} playerName={playerName}>
        {children}
      </GameConnection>
    </RegistryProvider>
  );
}

function GameConnection({
  code,
  playerName,
  children,
}: {
  code: string;
  playerName: string;
  children: ReactNode;
}) {
  const setGameState = useAtomSet(gameStateAtom);
  const setSendFn = useAtomSet(sendFnAtom);
  const stateRef = useRef<GameState>(createInitialState(code, playerName));

  const updateState = useCallback(
    (fn: (prev: GameState) => GameState) => {
      stateRef.current = fn(stateRef.current);
      setGameState(stateRef.current);
    },
    [setGameState],
  );

  useEffect(() => {
    const initial = createInitialState(code, playerName);
    stateRef.current = initial;
    setGameState(initial);

    const url = `wss://luck-of-the-draw-server.fly.dev/lobby/${code}/ws?name=${encodeURIComponent(playerName)}`;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      updateState((s) => ({ ...s, connected: true }));
    };

    ws.onclose = () => {
      updateState((s) => ({ ...s, connected: false }));
    };

    ws.onerror = () => {
      updateState((s) => ({ ...s, connected: false }));
    };

    ws.onmessage = (event) => {
      const raw = JSON.parse(event.data as string) as Record<string, unknown>;
      try {
        const msg = decodeMessage(raw);
        applyMessage(updateState, msg);
      } catch (e) {
        console.warn(`Failed to decode WS message (type=${raw.type}):`, raw, e);
      }
    };

    setSendFn({
      fn: (msg: ClientMessage) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(msg));
        }
      },
    });

    return () => {
      ws.close();
    };
  }, [code, playerName, setGameState, setSendFn, updateState]);

  return <>{children}</>;
}

function applyMessage(
  update: (fn: (prev: GameState) => GameState) => void,
  msg: ServerMessage,
): void {
  switch (msg.type) {
    case "lobby:state":
      update((s) => ({
        ...s,
        code: msg.code,
        host: msg.host,
        players: msg.players as ReadonlyArray<string>,
        scoreboard: msg.scoreboard as ReadonlyArray<ScoreEntry>,
        settings: msg.settings,
        phase: msg.phase === "lobby" ? "lobby" : s.phase,
      }));
      break;

    case "player:joined":
      update((s) => ({
        ...s,
        players: msg.players as ReadonlyArray<string>,
        scoreboard: msg.scoreboard as ReadonlyArray<ScoreEntry>,
      }));
      break;

    case "player:left":
      update((s) => ({
        ...s,
        players: msg.players as ReadonlyArray<string>,
      }));
      break;

    case "lobby:host_changed":
      update((s) => ({
        ...s,
        host: msg.host,
      }));
      break;

    case "lobby:settings_updated":
      update((s) => ({
        ...s,
        settings: msg.settings,
      }));
      break;

    case "game:started":
      update((s) => ({
        ...s,
        phase: "playing",
        settings: msg.settings,
        players: msg.players as ReadonlyArray<string>,
      }));
      break;

    case "round:start":
      update((s) => ({
        ...s,
        phase: "playing",
        currentRound: msg,
        roundResult: null,
        wrongAnswers: [],
      }));
      break;

    case "answer:wrong":
      update((s) => ({
        ...s,
        wrongAnswers: [...s.wrongAnswers, msg.playerID],
      }));
      break;

    case "round:end": {
      const result: RoundResult = {
        roundNumber: msg.roundNumber,
        draw: msg.draw,
        winnerName: msg.winnerName,
        winnerGuess: msg.winnerGuess ?? null,
        validPlayers: msg.validPlayers as ReadonlyArray<ValidPlayer>,
        validPlayerCount: msg.validPlayerCount,
        nextRoundIn: msg.nextRoundIn,
      };
      update((s) => ({
        ...s,
        phase: "round_result",
        roundResult: result,
        scoreboard: msg.scoreboard as ReadonlyArray<ScoreEntry>,
        currentRound: null,
      }));
      break;
    }

    case "game:end":
      update((s) => ({
        ...s,
        phase: "ended",
        scoreboard: msg.scoreboard as ReadonlyArray<ScoreEntry>,
        currentRound: null,
      }));
      break;

    case "game:sudden_death":
      update((s) => ({
        ...s,
        phase: "sudden_death",
        suddenDeathPlayers: msg.tiedPlayers as ReadonlyArray<string>,
        scoreboard: msg.scoreboard as ReadonlyArray<ScoreEntry>,
      }));
      break;

    case "error":
      console.error("Server error:", msg.message);
      break;
  }
}

// --- Hooks ---

export function useGamePhase(): GamePhase {
  return useAtomValue(phaseAtom);
}

export function usePlayers(): ReadonlyArray<string> {
  return useAtomValue(playersAtom);
}

export function useScoreboard() {
  return useAtomValue(scoreboardAtom);
}

export function useSettings() {
  return useAtomValue(settingsAtom);
}

export function useCurrentRound() {
  return useAtomValue(currentRoundAtom);
}

export function useRoundResult() {
  return useAtomValue(roundResultAtom);
}

export function useHost(): string {
  return useAtomValue(hostAtom);
}

export function useIsHost(): boolean {
  return useAtomValue(isHostAtom);
}

export function useConnected(): boolean {
  return useAtomValue(connectedAtom);
}

export function useWrongAnswers(): ReadonlyArray<string> {
  return useAtomValue(wrongAnswersAtom);
}

export function useSuddenDeathPlayers(): ReadonlyArray<string> {
  return useAtomValue(suddenDeathPlayersAtom);
}

export function useSendMessage(): (msg: ClientMessage) => void {
  return useAtomValue(sendFnAtom).fn;
}

export function useGameState() {
  return useAtomValue(gameStateAtom);
}
