import React, { forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, ...props }, ref) => {
    return (
      <div className="flex flex-col w-full space-y-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={twMerge(
            clsx(
              "flex h-11 w-full rounded-lg border border-slate-800 bg-[#0b0c10] px-3.5 py-2 text-sm text-slate-100 ring-offset-[#090a0f] placeholder-slate-500 transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none",
              {
                "border-red-500 focus:border-red-500 focus:ring-red-500": !!error,
              }
            ),
            className
          )}
          {...props}
        />
        {error ? (
          <span className="text-xs font-medium text-red-500 leading-none">
            {error}
          </span>
        ) : helperText ? (
          <span className="text-xs text-slate-500 leading-none">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
