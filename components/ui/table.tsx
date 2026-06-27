import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({
  className,
  ...props
}) => (
  <div className="w-full overflow-x-auto rounded-lg border border-panel-border bg-card/50">
    <table className={twMerge("w-full text-sm text-left text-slate-300", className)} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  ...props
}) => (
  <thead
    className={twMerge("text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-panel-border bg-panel-elevated", className)}
    {...props}
  />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  ...props
}) => <tbody className={twMerge("divide-y divide-panel-border/60 bg-card/20", className)} {...props} />;

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className,
  ...props
}) => (
  <tr
    className={twMerge("hover:bg-panel-surface/50 transition-colors duration-150", className)}
    {...props}
  />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  ...props
}) => <th className={twMerge("px-6 py-4 font-semibold text-slate-400", className)} {...props} />;

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  ...props
}) => <td className={twMerge("px-6 py-4 text-slate-300 whitespace-nowrap", className)} {...props} />;
