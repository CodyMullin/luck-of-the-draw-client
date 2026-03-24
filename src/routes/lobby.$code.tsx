import { createFileRoute } from "@tanstack/react-router";
import { GameProvider, useGamePhase } from "../game/GameContext.tsx";
import { LobbyView } from "../components/LobbyView.tsx";
import { GameView } from "../components/GameView.tsx";
import { GameEndView } from "../components/GameEndView.tsx";
import { ReconnectBanner } from "../components/ReconnectBanner.tsx";

type LobbySearch = {
  name: string;
};

export const Route = createFileRoute("/lobby/$code")({
  validateSearch: (search: Record<string, unknown>): LobbySearch => ({
    name: (search["name"] as string) ?? "",
  }),
  component: LobbyPage,
});

function LobbyPage() {
  const { code } = Route.useParams();
  const { name } = Route.useSearch();

  return (
    <GameProvider code={code} playerName={name}>
      <ReconnectBanner />
      <PhaseRouter />
    </GameProvider>
  );
}

function PhaseRouter() {
  const phase = useGamePhase();

  switch (phase) {
    case "lobby":
      return <LobbyView />;
    case "playing":
    case "round_result":
      return <GameView />;
    case "ended":
      return <GameEndView />;
    case "sudden_death":
      return <GameEndView />;
    default:
      return <LobbyView />;
  }
}
