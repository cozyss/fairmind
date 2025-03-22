"use client";

import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
};

export function Card({ 
  children, 
  className = "", 
  onClick,
  hover = false
}: CardProps) {
  return (
    <div 
      className={`rounded-lg bg-white shadow-md ${hover ? 'transition-all duration-300 hover:shadow-xl hover:scale-[1.02]' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ 
  children, 
  className = "" 
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-b border-gray-100 p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ 
  children, 
  className = "" 
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-xl font-semibold text-gray-800 ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ 
  children, 
  className = "" 
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ 
  children, 
  className = "" 
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-t border-gray-100 p-4 ${className}`}>
      {children}
    </div>
  );
}
