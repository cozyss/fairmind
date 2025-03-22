"use client";

import { ReactNode } from "react";
import { PlusIcon } from "./Icons";
import { Button } from "./Button";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center ${className}`}>
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>}
      {action && (
        <Button 
          variant="primary" 
          onClick={action.onClick}
          icon={<PlusIcon size={16} />}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
