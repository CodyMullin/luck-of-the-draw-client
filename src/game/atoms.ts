import { Atom } from "@effect-atom/atom-react";
import { Option } from "effect";
import type { ClientMessage } from "./schema.ts";
import type { GameState } from "./state.ts";
import { createInitialState } from "./state.ts";

// --- WebSocket send function ref ---
// Wrapped in an object to avoid useAtomSet treating a function value as an updater callback.

type SendFn = (msg: ClientMessage) => void;
interface SendFnBox {
  readonly fn: SendFn;
}
const noopBox: SendFnBox = { fn: () => {} };
export const sendFnAtom = Atom.writable<SendFnBox, SendFnBox>(
  (get) => Option.getOrElse(get.self<SendFnBox>(), () => noopBox),
  (_ctx, value) => {
    _ctx.setSelf(value);
  },
);
Atom.keepAlive(sendFnAtom);

// --- Game state atom ---

const defaultState = createInitialState("", "");
export const gameStateAtom = Atom.writable<GameState, GameState>(
  (get) => Option.getOrElse(get.self<GameState>(), () => defaultState),
  (_ctx, value) => {
    _ctx.setSelf(value);
  },
);
Atom.keepAlive(gameStateAtom);

// --- Derived atoms ---

export const phaseAtom = Atom.make((get: Atom.Context) => get(gameStateAtom).phase);
export const playersAtom = Atom.make((get: Atom.Context) => get(gameStateAtom).players);
export const scoreboardAtom = Atom.make((get: Atom.Context) => get(gameStateAtom).scoreboard);
export const settingsAtom = Atom.make((get: Atom.Context) => get(gameStateAtom).settings);
export const currentRoundAtom = Atom.make((get: Atom.Context) => get(gameStateAtom).currentRound);
export const roundResultAtom = Atom.make((get: Atom.Context) => get(gameStateAtom).roundResult);
export const hostAtom = Atom.make((get: Atom.Context) => get(gameStateAtom).host);
export const isHostAtom = Atom.make(
  (get: Atom.Context) => get(gameStateAtom).host === get(gameStateAtom).playerName,
);
export const connectedAtom = Atom.make((get: Atom.Context) => get(gameStateAtom).connected);
export const wrongAnswersAtom = Atom.make((get: Atom.Context) => get(gameStateAtom).wrongAnswers);
export const suddenDeathPlayersAtom = Atom.make(
  (get: Atom.Context) => get(gameStateAtom).suddenDeathPlayers,
);
