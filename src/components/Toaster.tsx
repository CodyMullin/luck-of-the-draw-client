import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

type ToastType = "info" | "error" | "success";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

type ToastFn = (message: string, type?: ToastType) => void;

const ToastContext = createContext<ToastFn>(() => {});

let nextId = 0;

export function useToast(): ToastFn {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast: ToastFn = useCallback((message, type = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed right-4 bottom-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg border-2 px-4 py-2 font-display text-sm shadow-lg transition-all ${
              t.type === "error"
                ? "border-error/50 bg-error/90 text-chalk"
                : t.type === "success"
                  ? "border-grass/50 bg-grass/90 text-chalk"
                  : "border-leather/50 bg-leather/90 text-chalk"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function Toaster() {
  return null;
}
