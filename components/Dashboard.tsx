import React from 'react';
import { MetricSummary } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { translations, Language } from '../utils/translations';
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertCircle, Award } from 'lucide-react';

const COLORS = ['#1d6b4a', '#2d9b6a', '#c49a2a', '#b85c1a', '#3d3d38', '#6b6b65'];

interface DashboardProps {
  data?: MetricSummary;
  lang?: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ data, lang = 'en' }) => {
  if (!data) return null;
  const t = translations[lang];

  // Helper to format financial numbers cleanly (always KES)
  const formatCurrency = (val: number) => {
    return `KES ${val.toLocaleString()}`;
  };

  // Safe percentage growth calculation
  const revGrowth = data.revenueLastWeek > 0 
    ? Math.round(((data.revenueThisWeek - data.revenueLastWeek) / data.revenueLastWeek) * 100)
    : 0;

  return (
    <div className="space-y-6 mb-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-border2 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-ink3 text-xs font-semibold">
            <span>{t.revenueThisWeek}</span>
            <DollarSign className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold font-mono text-ink">
            {formatCurrency(data.revenueThisWeek)}
          </p>
          <div className="flex items-center gap-1 text-xs font-medium">
            {revGrowth >= 0 ? (
              <span className="text-emerald-600 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +{revGrowth}% vs last week
              </span>
            ) : (
              <span className="text-rose-600 flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" /> {revGrowth}% vs last week
              </span>
            )}
          </div>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border2 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-ink3 text-xs font-semibold">
            <span>{t.utilization}</span>
            <Activity className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold font-mono text-ink">{data.utilization}%</p>
          <p className="text-xs text-ink3">Clinical room capacity utilized</p>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border2 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-ink3 text-xs font-semibold">
            <span>{t.cancellations}</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-ink">{data.cancellations}</p>
          <p className="text-xs text-ink3">Unfilled appointment slots</p>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border2 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-ink3 text-xs font-semibold">
            <span>{data.unbilledRevenueKes ? 'Unbilled Leakage' : 'Practitioner Count'}</span>
            <Award className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold font-mono text-ink">
            {data.unbilledRevenueKes 
              ? formatCurrency(data.unbilledRevenueKes)
              : data.practitionerPerformance?.length || 0}
          </p>
          <p className="text-xs text-ink3">
            {data.unbilledRevenueKes ? 'Revenue variance identified' : 'Active medical officers'}
          </p>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface p-5 rounded-xl border border-border2 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2 font-serif">
            <Activity className="w-4 h-4 text-accent" />
            {t.practitionerPerformance}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.practitionerPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#faf9f6', borderColor: '#d4d4d4', borderRadius: '8px' }}
                />
                <Bar dataKey="patients" fill="#1d6b4a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface p-5 rounded-xl border border-border2 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2 font-serif">
            <DollarSign className="w-4 h-4 text-accent" />
            {t.procedureMix}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.procedureMix}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#1d6b4a"
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {data.procedureMix.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => formatCurrency(Number(val))}
                  contentStyle={{ backgroundColor: '#faf9f6', borderColor: '#d4d4d4', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
