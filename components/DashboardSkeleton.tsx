import React from 'react';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Key Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface p-6 rounded-2xl border border-border2 shadow-sm h-32 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="h-4 bg-surface2 rounded w-24"></div>
              <div className="h-8 w-8 bg-surface2 rounded-lg"></div>
            </div>
            <div className="space-y-2">
              <div className="h-8 bg-surface2 rounded w-32"></div>
              <div className="h-3 bg-surface2 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-border2 shadow-sm h-96 flex flex-col">
          <div className="h-6 bg-surface2 rounded w-48 mb-6"></div>
          <div className="flex-1 bg-surface2 rounded-xl border border-border2"></div>
        </div>
        <div className="bg-surface p-6 rounded-2xl border border-border2 shadow-sm h-96 flex flex-col">
          <div className="h-6 bg-surface2 rounded w-32 mb-6"></div>
          <div className="flex-1 bg-surface2 rounded-xl border border-border2 rounded-full mx-auto w-48 h-48 mt-8"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
