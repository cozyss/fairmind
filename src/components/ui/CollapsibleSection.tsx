"use client";

import { ReactNode, useState } from "react";

type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  className = "",
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-md border border-gray-200 bg-gray-50 ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none"
      >
        <span>{title}</span>
        <svg
          className={`${isOpen ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500 transition-transform duration-200`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="animate-slideUp px-4 py-3 text-sm text-gray-600">
          {children}
        </div>
      )}
    </div>
  );
}
