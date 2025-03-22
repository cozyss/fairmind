"use client";

import { ChartIcon, InfoIcon } from "@/components/ui/Icons";
import { HoverDisclosure } from "@/components/ui/HoverDisclosure";

type ObjectiveCriterionCardProps = {
  title: string;
  description: string;
  source?: string;
  relevance: string;
  index: number;
};

export function ObjectiveCriterionCard({
  title,
  description,
  source,
  relevance,
  index,
}: ObjectiveCriterionCardProps) {
  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-medium text-green-800">
              <ChartIcon size={14} />
            </div>
            <h4 className="font-medium text-gray-800">{title}</h4>
          </div>
          <HoverDisclosure
            trigger={
              <div className="cursor-help text-gray-400 hover:text-gray-600">
                <InfoIcon size={16} />
              </div>
            }
            contentClassName="w-72 max-w-xs"
          >
            <div className="p-2">
              <h5 className="mb-1 font-medium">Why this is relevant:</h5>
              <p className="text-sm text-gray-600">{relevance}</p>
            </div>
          </HoverDisclosure>
        </div>
      </div>
      
      <div className="p-4">
        <div className="mb-3 text-gray-700">
          <p>{description}</p>
        </div>
        
        {source && (
          <div className="mt-2 text-xs text-gray-500">
            <span className="font-medium">Source:</span>{" "}
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              {new URL(source).hostname}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}