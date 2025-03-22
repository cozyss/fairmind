"use client";

import { InfoIcon } from "@/components/ui/Icons";
import { HoverDisclosure } from "@/components/ui/HoverDisclosure";

type ResponseSuggestionCardProps = {
  title: string;
  content: string;
  reasoning: string;
  index: number;
};

export function ResponseSuggestionCard({
  title,
  content,
  reasoning,
  index,
}: ResponseSuggestionCardProps) {
  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-center">
          <div className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-800 transition-colors duration-200">
            {index + 1}
          </div>
          <h4 className="font-medium text-gray-800">{title}</h4>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-4 rounded-md bg-gray-50 p-3 text-gray-700 shadow-inner">
          <p className="whitespace-pre-line">{content}</p>
        </div>
        
        <div className="text-sm text-gray-600">
          <HoverDisclosure
            trigger={
              <span className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors duration-200">
                <InfoIcon size={14} className="mr-1" />
                <span>Why this works</span>
              </span>
            }
            position="auto"
            contentClassName="w-72 max-w-xs"
          >
            <div className="p-2 text-sm text-gray-600">
              <h5 className="mb-1 font-medium">Why this works:</h5>
              <p>{reasoning}</p>
            </div>
          </HoverDisclosure>
        </div>
      </div>
    </div>
  );
}