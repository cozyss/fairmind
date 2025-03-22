"use client";

import ReactMarkdown from "react-markdown";
import { HandshakeIcon } from "@/components/ui/Icons";

type NegotiationOptionCardProps = {
  option: string;
  index: number;
};

export function NegotiationOptionCard({
  option,
  index,
}: NegotiationOptionCardProps) {
  // Extract title from bold markdown format (if exists)
  const boldTitleRegex = /^\*\*([^*]+)\*\*:?/;
  const match = option.match(boldTitleRegex);
  
  // Get the title and content
  const title = match ? match[1] : `Option ${index + 1}`;
  const content = match ? option.replace(boldTitleRegex, '') : option;

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
        <div className="flex items-center">
          <div className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-800">
            {index + 1}
          </div>
          <h4 className="font-medium text-gray-800">{title}</h4>
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-gray-700">
          <ReactMarkdown className="prose prose-sm max-w-none whitespace-pre-line">
            {content.trim()}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}