"use client";

import { useState, ReactNode } from "react";

type Tab = {
  id: string;
  label: string;
  icon?: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  children: ReactNode[];
  defaultTabId?: string;
  className?: string;
  tabsClassName?: string;
  contentClassName?: string;
  sticky?: boolean;
  stickyOffset?: string;
};

export function Tabs({
  tabs,
  children,
  defaultTabId,
  className = "",
  tabsClassName = "",
  contentClassName = "",
  sticky = false,
  stickyOffset = "0px",
}: TabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTabId || tabs[0].id);

  return (
    <div className={`w-full ${className}`}>
      <div 
        className={`
          mb-4 border-b border-gray-200 bg-white
          ${sticky ? `sticky top-[${stickyOffset}] z-10 shadow-sm` : ''}
          ${tabsClassName}
        `}
      >
        <div className="scrollbar-hide -mb-px flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                group relative flex min-w-max items-center whitespace-nowrap px-4 py-3 text-sm font-medium transition-all duration-200 sm:text-base
                ${activeTab === tab.id
                  ? "text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
                }
              `}
              aria-selected={activeTab === tab.id}
              role="tab"
            >
              {tab.icon && (
                <span className={`mr-2 transition-colors duration-200 ${
                  activeTab === tab.id ? "text-primary-500" : "text-gray-400 group-hover:text-gray-500"
                }`}>
                  {tab.icon}
                </span>
              )}
              {tab.label}
              <span 
                className={`absolute bottom-0 left-0 h-0.5 w-full transform bg-primary-500 transition-transform duration-200 ${
                  activeTab === tab.id ? "scale-x-100" : "scale-x-0"
                }`} 
              />
            </button>
          ))}
        </div>
      </div>
      <div className={`animate-fadeIn ${contentClassName}`}>
        {children[tabs.findIndex((tab) => tab.id === activeTab)]}
      </div>
    </div>
  );
}