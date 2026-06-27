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
    <div className={twMerge("flex border-b border-panel-border space-x-6", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "flex items-center space-x-2 py-3 px-1 text-sm font-medium border-b-2 transition-all cursor-pointer",
              {
                "border-brand text-foreground": isActive,
                "border-transparent text-muted-foreground hover:text-foreground": !isActive,
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
