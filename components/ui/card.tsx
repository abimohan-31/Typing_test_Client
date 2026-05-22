import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  glass = true,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx("rounded-xl border border-slate-800 transition-all duration-300", {
          "glass": glass,
          "bg-[#0e111a]/90": !glass,
          "glass-hover": hoverable,
        }),
        className
      )}
      {...props}
    />
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return <div className={twMerge("flex flex-col space-y-1.5 p-6", className)} {...props} />;
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  ...props
}) => {
  return (
    <h3
      className={twMerge("text-lg font-semibold leading-none tracking-tight text-white", className)}
      {...props}
    />
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  ...props
}) => {
  return <p className={twMerge("text-sm text-slate-400", className)} {...props} />;
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return <div className={twMerge("p-6 pt-0", className)} {...props} />;
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div className={twMerge("flex items-center p-6 pt-0 border-t border-slate-800/50 mt-4", className)} {...props} />
  );
};
