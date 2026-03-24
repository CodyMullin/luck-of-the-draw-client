import type {
  LobbySettings,
  ScoreEntry,
  ValidPlayer,
  ServerMessage,
} from "./schema.ts";

export type GamePhase = "lobby" | "playing" | "round_result" | "ended" | "sudden_death";

export interface RoundResult {
  readonly roundNumber: number;
  readonly draw: Extract<ServerMessage, { type: "round:end" }>["draw"];
  readonly winnerName: string | null;
  readonly validPlayers: ReadonlyArray<ValidPlayer>;
  readonly validPlayerCount: number;
  readonly nextRoundIn: number;
}

export interface GameState {
  readonly phase: GamePhase;
  readonly code: string;
  readonly host: string;
  readonly playerName: string;
  readonly players: ReadonlyArray<string>;
  readonly scoreboard: ReadonlyArray<ScoreEntry>;
  readonly settings: LobbySettings;
  readonly currentRound: Extract<ServerMessage, { type: "round:start" }> | null;
  readonly roundResult: RoundResult | null;
  readonly suddenDeathPlayers: ReadonlyArray<string>;
  readonly connected: boolean;
  readonly wrongAnswers: ReadonlyArray<string>;
}

export const initialSettings: LobbySettings = {
  yearMin: 1960,
  yearMax: 2025,
  rounds: 10,
  timeLimitSeconds: 30,
  teamPool: null,
  positionPool: null,
} as LobbySettings;

export function createInitialState(code: string, playerName: string): GameState {
  return {
    phase: "lobby",
    code,
    host: "",
    playerName,
    players: [],
    scoreboard: [],
    settings: initialSettings,
    currentRound: null,
    roundResult: null,
    suddenDeathPlayers: [],
    connected: false,
    wrongAnswers: [],
  };
}
