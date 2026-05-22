import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface TabsProps {
  activeTab: string;
  onChange: (tabId: string) => void;
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  activeTab,
  onChange,
  tabs,
  className,
}) => {
  return (
    <div className={twMerge("flex border-b border-slate-800 space-x-6", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "flex items-center space-x-2 py-3 px-1 text-sm font-medium border-b-2 transition-all cursor-pointer",
              {
                "border-indigo-500 text-white": isActive,
                "border-transparent text-slate-400 hover:text-slate-200": !isActive,
              }
            )}
          >
            {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
