"use client";

import { ReactNode } from "react";
import { Disclosure as HeadlessDisclosure } from "@headlessui/react";

type DisclosureProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function Disclosure({
  title,
  children,
  defaultOpen = false,
  className = "",
}: DisclosureProps) {
  return (
    <HeadlessDisclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <div className={`rounded-lg border border-gray-200 bg-white overflow-hidden ${className}`}>
          <HeadlessDisclosure.Button className="flex w-full justify-between items-center px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-blue-500">
            <span className="text-lg font-semibold">{title}</span>
            <svg
              className={`${open ? 'rotate-180 transform' : ''} h-5 w-5 text-gray-500 transition-transform duration-200`}
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
          </HeadlessDisclosure.Button>
          <HeadlessDisclosure.Panel className="px-4 py-3 bg-gray-50 text-sm text-gray-600 animate-slideUp">
            {children}
          </HeadlessDisclosure.Panel>
        </div>
      )}
    </HeadlessDisclosure>
  );
}
