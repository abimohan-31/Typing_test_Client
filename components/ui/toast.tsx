"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

type Toast = {
  id: number;
  message: string;
};

const TOAST_EVENT = "app-toast";
const TOAST_DURATION = 3000;

export function toast(message: string) {
  window.dispatchEvent(
    new CustomEvent<string>(TOAST_EVENT, {
      detail: message,
    })
  );
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      const id = Date.now();

      setToasts((current) => [...current, { id, message }]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, TOAST_DURATION);
    };

    window.addEventListener(TOAST_EVENT, handleToast);

    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
      {toasts.map((item) => (
        <div
          key={item.id}
          role="status"
          className="flex items-start gap-3 rounded-lg border border-emerald-500/25 bg-panel-elevated px-4 py-3 text-sm text-foreground shadow-lg shadow-black/20"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <p className="min-w-0 flex-1 leading-5">{item.message}</p>
          <button
            type="button"
            aria-label="Dismiss notification"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-panel-surface hover:text-foreground"
            onClick={() =>
              setToasts((current) => current.filter((toast) => toast.id !== item.id))
            }
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
