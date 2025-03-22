"use client";

type SkeletonProps = {
  className?: string;
  width?: string | number;
  height?: string | number;
};

export function Skeleton({ className = "", width, height }: SkeletonProps) {
  const style: React.CSSProperties = {};
  
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  
  return (
    <div 
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      style={style}
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="rounded-lg border-2 border-transparent bg-white p-6 shadow-lg">
      <Skeleton className="mb-3 h-7 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

export function ProjectDetailsSkeleton() {
  return (
    <div className="rounded-lg bg-white p-8 shadow-lg">
      <Skeleton className="mb-6 h-9 w-2/3" />
      
      <div className="mb-8">
        <Skeleton className="mb-2 h-7 w-1/3" />
        <Skeleton className="mb-4 h-32 w-full" />
        <Skeleton className="mb-2 h-5 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
      
      <div className="mb-8">
        <Skeleton className="mb-2 h-7 w-1/3" />
        <Skeleton className="mb-4 h-32 w-full" />
        <Skeleton className="mb-2 h-5 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
      
      <div className="mb-8">
        <Skeleton className="mb-4 h-10 w-40" />
      </div>
      
      <div>
        <Skeleton className="mb-2 h-4 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
