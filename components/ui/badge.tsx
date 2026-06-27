import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "destructive" | "warning" | "leader" | "student" | "admin";
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
            "bg-brand/10 text-brand-light border-brand/20": variant === "primary",
            "bg-panel-surface text-muted-foreground border-panel-border": variant === "secondary",
            "bg-role-student/10 text-role-student border-role-student/20": variant === "success",
            "bg-destructive/10 text-destructive border-destructive/20": variant === "destructive",
            "bg-warning/10 text-warning border-warning/20": variant === "warning",
            "bg-role-leader/10 text-role-leader border-role-leader/20": variant === "leader",
            "bg-role-student/10 text-role-student border-role-student/20": variant === "student",
            "bg-role-admin/10 text-role-admin border-role-admin/20": variant === "admin",
          }
        ),
        className
      )}
      {...props}
    />
  );
};
