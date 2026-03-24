import { useState, useEffect, useRef, useCallback } from "react";
import type { PlayerSearchResult } from "./schema.ts";

export function usePlayerSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReadonlyArray<PlayerSearchResult>>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(() => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      fetch(`https://luck-of-the-draw-server.fly.dev/players/search?q=${encodeURIComponent(query)}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data: unknown) => {
          const obj = data as Record<string, unknown>;
          const items = Array.isArray(obj.results)
            ? (obj.results as PlayerSearchResult[])
            : Array.isArray(data)
              ? (data as PlayerSearchResult[])
              : [];
          setResults(items);
          setLoading(false);
        })
        .catch((err) => {
          if ((err as Error).name !== "AbortError") {
            setLoading(false);
          }
        });
    }, 250);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const reset = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  return { query, setQuery, results, loading, reset };
}
