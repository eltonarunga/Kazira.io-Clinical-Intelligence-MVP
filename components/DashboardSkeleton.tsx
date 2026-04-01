import React from 'react';

const DashboardSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-surface2 h-24 rounded-xl border border-border2"></div>
      ))}
      <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-surface2 h-64 rounded-xl border border-border2"></div>
      <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-surface2 h-64 rounded-xl border border-border2"></div>
    </div>
  );
};

export default DashboardSkeleton;
