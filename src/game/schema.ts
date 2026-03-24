import { Schema } from "effect";

// --- Settings ---

export const LobbySettings = Schema.Struct({
  yearMin: Schema.Number,
  yearMax: Schema.Number,
  rounds: Schema.Number,
  timeLimitSeconds: Schema.Number,
  teamPool: Schema.NullOr(Schema.Array(Schema.String)),
  positionPool: Schema.NullOr(Schema.Array(Schema.String)),
});
export type LobbySettings = typeof LobbySettings.Type;

// --- Scoreboard ---

export const ScoreEntry = Schema.Struct({
  displayName: Schema.String,
  score: Schema.Number,
});
export type ScoreEntry = typeof ScoreEntry.Type;

// --- Valid Player (in round:end) ---

export const ValidPlayer = Schema.Struct({
  playerID: Schema.String,
  nameFirst: Schema.String,
  nameLast: Schema.String,
});
export type ValidPlayer = typeof ValidPlayer.Type;

// --- Draw ---

export const Draw = Schema.Struct({
  yearID: Schema.Number,
  teamID: Schema.String,
  teamName: Schema.String,
  position: Schema.String,
});
export type Draw = typeof Draw.Type;

// --- Inbound WS Messages ---

const LobbyState = Schema.Struct({
  type: Schema.Literal("lobby:state"),
  code: Schema.String,
  phase: Schema.String,
  settings: LobbySettings,
  host: Schema.String,
  players: Schema.Array(Schema.String),
  scoreboard: Schema.Array(ScoreEntry),
});

const PlayerJoined = Schema.Struct({
  type: Schema.Literal("player:joined"),
  displayName: Schema.String,
  players: Schema.Array(Schema.String),
  scoreboard: Schema.Array(ScoreEntry),
});

const PlayerLeft = Schema.Struct({
  type: Schema.Literal("player:left"),
  displayName: Schema.String,
  players: Schema.Array(Schema.String),
});

const HostChanged = Schema.Struct({
  type: Schema.Literal("lobby:host_changed"),
  host: Schema.String,
});

const SettingsUpdated = Schema.Struct({
  type: Schema.Literal("lobby:settings_updated"),
  settings: LobbySettings,
});

const GameStarted = Schema.Struct({
  type: Schema.Literal("game:started"),
  settings: LobbySettings,
  players: Schema.Array(Schema.String),
});

const RoundStart = Schema.Struct({
  type: Schema.Literal("round:start"),
  roundNumber: Schema.Number,
  totalRounds: Schema.Number,
  year: Schema.Number,
  teamName: Schema.String,
  position: Schema.String,
  timeLimit: Schema.Number,
});

const AnswerWrong = Schema.Struct({
  type: Schema.Literal("answer:wrong"),
  playerID: Schema.String,
});

const RoundEnd = Schema.Struct({
  type: Schema.Literal("round:end"),
  roundNumber: Schema.Number,
  draw: Draw,
  winnerId: Schema.NullOr(Schema.Number),
  winnerName: Schema.NullOr(Schema.String),
  validPlayers: Schema.Array(ValidPlayer),
  validPlayerCount: Schema.Number,
  scoreboard: Schema.Array(ScoreEntry),
  nextRoundIn: Schema.optionalWith(Schema.Number, { default: () => 10 }),
});

const GameEnd = Schema.Struct({
  type: Schema.Literal("game:end"),
  scoreboard: Schema.Array(ScoreEntry),
});

const SuddenDeath = Schema.Struct({
  type: Schema.Literal("game:sudden_death"),
  tiedPlayers: Schema.Array(Schema.String),
  scoreboard: Schema.Array(ScoreEntry),
});

const ServerError = Schema.Struct({
  type: Schema.Literal("error"),
  message: Schema.String,
});

export const ServerMessage = Schema.Union(
  LobbyState,
  PlayerJoined,
  PlayerLeft,
  HostChanged,
  SettingsUpdated,
  GameStarted,
  RoundStart,
  AnswerWrong,
  RoundEnd,
  GameEnd,
  SuddenDeath,
  ServerError,
);

export type ServerMessage = typeof ServerMessage.Type;

// --- Outbound WS Messages ---

export interface UpdateSettingsMsg {
  readonly type: "lobby:settings";
  readonly settings: Partial<{
    yearMin: number;
    yearMax: number;
    rounds: number;
    timeLimitSeconds: number;
  }>;
}

export interface StartGameMsg {
  readonly type: "game:start";
}

export interface SubmitAnswerMsg {
  readonly type: "answer:submit";
  readonly playerID: string;
}

export type ClientMessage = UpdateSettingsMsg | StartGameMsg | SubmitAnswerMsg;

// --- Player Search API ---

export const PlayerSearchResult = Schema.Struct({
  playerID: Schema.String,
  nameFirst: Schema.String,
  nameLast: Schema.String,
});
export type PlayerSearchResult = typeof PlayerSearchResult.Type;
