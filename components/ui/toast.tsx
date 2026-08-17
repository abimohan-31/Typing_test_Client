"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";

type Toast = {
  id: number;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

const TOAST_EVENT = "app-toast";
const TOAST_DURATION = 3000;
const ACTION_TOAST_DURATION = 8000;

type ToastInput =
  | string
  | {
      message: string;
      action?: {
        label: string;
        onClick: () => void;
      };
    };

export function toast(input: ToastInput) {
  const detail = typeof input === "string" ? { message: input } : input;

  window.dispatchEvent(
    new CustomEvent<Omit<Toast, "id">>(TOAST_EVENT, {
      detail,
    })
  );
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent<Omit<Toast, "id">>).detail;
      const id = Date.now();

      setToasts((current) => [...current, { id, ...detail }]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, detail.action ? ACTION_TOAST_DURATION : TOAST_DURATION);
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
          {item.action && (
            <button
              type="button"
              className="shrink-0 rounded-md border border-brand/30 px-2 py-1 text-xs font-semibold text-brand-light transition-colors hover:bg-brand/10"
              onClick={() => {
                item.action?.onClick();
                setToasts((current) => current.filter((toast) => toast.id !== item.id));
              }}
            >
              {item.action.label}
            </button>
          )}
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
