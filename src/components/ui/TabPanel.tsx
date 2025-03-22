"use client";

import { ReactNode } from "react";

type TabPanelProps = {
  children: ReactNode;
  className?: string;
};

export function TabPanel({ children, className = "" }: TabPanelProps) {
  return (
    <div className={`w-full animate-fadeIn transition-opacity duration-200 ease-in-out ${className}`}>
      {children}
    </div>
  );
}