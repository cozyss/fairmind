"use client";

import { InfoIcon } from "./Icons";
import { HoverDisclosure } from "./HoverDisclosure";

type ScoreIndicatorProps = {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  reasoning?: string | null;
};

export function ScoreIndicator({ 
  score, 
  size = "md", 
  className = "",
  reasoning = null
}: ScoreIndicatorProps) {
  // Calculate the stroke-dashoffset based on the score
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  // Determine color based on score
  const getColor = () => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-primary-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };
  
  // Size classes
  const sizeClasses = {
    sm: "w-12 h-12 text-sm",
    md: "w-16 h-16 text-base",
    lg: "w-20 h-20 text-lg",
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          className="text-gray-200"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        {/* Progress circle */}
        <circle
          className={getColor()}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span className={`absolute font-semibold ${getColor()}`}>
        {score}
      </span>
      
      {reasoning && (
        <div className="absolute -right-2 -top-2">
          <HoverDisclosure
            trigger={
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700">
                <InfoIcon size={14} />
              </div>
            }
            position="auto"
            contentClassName="w-72 max-w-xs"
          >
            <div className="text-sm text-gray-600">
              <h5 className="mb-1 font-medium text-gray-700">Analysis</h5>
              <p className="whitespace-pre-line">{reasoning}</p>
            </div>
          </HoverDisclosure>
        </div>
      )}
    </div>
  );
}