import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

interface BaseButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  href?: string;
}

type ButtonProps = BaseButtonProps & 
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps>;

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  disabled,
  href,
  ...props
}) => {
  const styles = twMerge(
    clsx(
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
      {
        // Variants
        "bg-brand text-primary-foreground hover:bg-brand-light shadow-md shadow-brand/10 focus:ring-brand":
          variant === "primary",
        "bg-panel-surface text-foreground hover:bg-panel-muted border border-panel-border focus:ring-panel-border":
          variant === "secondary",
        "bg-transparent text-muted-foreground hover:bg-panel-elevated hover:text-foreground border border-panel-border focus:ring-panel-border":
          variant === "outline",
        "bg-transparent text-muted-foreground hover:bg-panel-elevated hover:text-foreground focus:ring-panel-border":
          variant === "ghost",
        "bg-destructive text-destructive-foreground hover:brightness-110 shadow-md shadow-destructive/10 focus:ring-destructive":
          variant === "destructive",

        // Sizes
        "text-xs px-3 py-1.5": size === "sm",
        "text-sm px-4 py-2.5": size === "md",
        "text-base px-6 py-3.5": size === "lg",
      }
    ),
    className
  );

  const loader = isLoading && (
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
  );

  if (href) {
    return (
      <Link
        href={href}
        className={styles}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(props as any)}
      >
        {loader}
        {children}
      </Link>
    );
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={styles}
      type="button"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
    >
      {loader}
      {children}
    </button>
  );
};
