import { useConnected } from "../game/GameContext.tsx";

export function ReconnectBanner() {
  const connected = useConnected();

  if (connected) return null;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 bg-warning py-2 text-center font-display text-sm font-bold text-dirt">
      Reconnecting...
    </div>
  );
}
