import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useToast } from "../components/Toaster.tsx";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [name, setName] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const canHost = name.trim().length > 0;
  const canJoin = name.trim().length > 0 && lobbyCode.trim().length > 0;

  async function handleHost() {
    if (!canHost) return;
    setIsCreating(true);
    try {
      const res = await fetch(`https://luck-of-the-draw-server.fly.dev/lobby`, { method: "POST" });
      if (!res.ok) {
        toast("Failed to create lobby", "error");
        return;
      }
      const data = (await res.json()) as { code: string };
      await navigate({
        to: "/lobby/$code",
        params: { code: data.code },
        search: { name: name.trim() },
      });
    } catch {
      toast("Failed to create lobby", "error");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleJoin() {
    if (!canJoin) return;
    await navigate({
      to: "/lobby/$code",
      params: { code: lobbyCode.trim().toUpperCase() },
      search: { name: name.trim() },
    });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-display text-5xl font-bold tracking-tight text-leather">
            Luck of the Draw
          </h1>
          <p className="mt-2 text-lg text-dirt/70">
            Name the player. Beat the clock. Outsmart your friends.
          </p>
        </div>

        <div className="rounded-lg border-2 border-leather/30 bg-cream-dark p-6 shadow-lg">
          <label className="block text-sm font-bold uppercase tracking-wider text-leather">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your display name"
            maxLength={20}
            className="mt-1 w-full rounded border-2 border-leather/20 bg-cream px-3 py-2 font-display text-dirt placeholder:text-dirt/40 focus:border-leather focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleHost}
            disabled={!canHost || isCreating}
            className="rounded-lg border-2 border-grass bg-grass px-4 py-3 font-display text-sm font-bold uppercase tracking-wider text-chalk transition-colors hover:bg-grass-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Host Game"}
          </button>

          <div className="flex gap-2">
            <input
              type="text"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
              placeholder="CODE"
              maxLength={6}
              className="w-24 rounded border-2 border-leather/20 bg-cream px-2 py-2 text-center font-display text-sm uppercase text-dirt placeholder:text-dirt/40 focus:border-leather focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleJoin();
              }}
            />
            <button
              onClick={handleJoin}
              disabled={!canJoin}
              className="flex-1 rounded-lg border-2 border-leather bg-leather px-3 py-3 font-display text-sm font-bold uppercase tracking-wider text-chalk transition-colors hover:bg-leather-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
