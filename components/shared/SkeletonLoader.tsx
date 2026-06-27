import React from "react";

export const SkeletonCard: React.FC = () => {
  return (
    <div className="rounded-xl border border-panel-border bg-card/80 p-6 animate-pulse space-y-4">
      <div className="h-4 w-1/3 rounded bg-slate-800" />
      <div className="h-8 w-1/2 rounded bg-slate-800" />
      <div className="h-3 w-3/4 rounded bg-slate-800" />
    </div>
  );
};

export const SkeletonTable: React.FC = () => {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-panel-border bg-card/50 p-6 animate-pulse space-y-4">
      <div className="h-6 w-full rounded bg-slate-800" />
      <div className="space-y-3 pt-2">
        <div className="h-4 w-full rounded bg-slate-800" />
        <div className="h-4 w-full rounded bg-slate-800" />
        <div className="h-4 w-full rounded bg-slate-800" />
        <div className="h-4 w-full rounded bg-slate-800" />
      </div>
    </div>
  );
};

export const SkeletonChart: React.FC = () => {
  return (
    <div className="rounded-xl border border-panel-border bg-card/60 p-6 animate-pulse space-y-4">
      <div className="h-4 w-1/4 rounded bg-slate-800" />
      <div className="h-56 w-full rounded bg-slate-800/60" />
    </div>
  );
};
