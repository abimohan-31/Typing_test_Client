import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "destructive" | "warning";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "secondary",
  ...props
}) => {
  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border transition-colors leading-none",
          {
            "bg-indigo-500/10 text-indigo-400 border-indigo-500/20": variant === "primary",
            "bg-slate-800 text-slate-300 border-slate-700": variant === "secondary",
            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20": variant === "success",
            "bg-red-500/10 text-red-400 border-red-500/20": variant === "destructive",
            "bg-amber-500/10 text-amber-400 border-amber-500/20": variant === "warning",
          }
        ),
        className
      )}
      {...props}
    />
  );
};
