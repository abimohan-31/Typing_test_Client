import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || isLoading}
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#090a0f] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          {
            // Variants
            "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 focus:ring-indigo-500":
              variant === "primary",
            "bg-[#1e293b] text-slate-100 hover:bg-[#334155] border border-slate-800 focus:ring-slate-600":
              variant === "secondary",
            "bg-transparent text-slate-300 hover:bg-slate-850 hover:text-white border border-slate-800 focus:ring-slate-600":
              variant === "outline",
            "bg-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200 focus:ring-slate-800":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/10 focus:ring-red-500":
              variant === "destructive",

            // Sizes
            "text-xs px-3 py-1.5": size === "sm",
            "text-sm px-4 py-2.5": size === "md",
            "text-base px-6 py-3.5": size === "lg",
          }
        ),
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};
