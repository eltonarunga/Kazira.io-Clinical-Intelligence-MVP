import React from 'react';
import { MetricSummary } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard: React.FC<{ data?: MetricSummary }> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-surface p-4 rounded-xl border border-border2 shadow-sm">
        <h3 className="text-sm text-ink3 mb-1">Revenue This Week</h3>
        <p className="text-2xl font-bold">${data.revenueThisWeek.toLocaleString()}</p>
      </div>
      <div className="bg-surface p-4 rounded-xl border border-border2 shadow-sm">
        <h3 className="text-sm text-ink3 mb-1">Utilization</h3>
        <p className="text-2xl font-bold">{data.utilization}%</p>
      </div>
      <div className="bg-surface p-4 rounded-xl border border-border2 shadow-sm">
        <h3 className="text-sm text-ink3 mb-1">Cancellations</h3>
        <p className="text-2xl font-bold">{data.cancellations}</p>
      </div>
      
      <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-surface p-4 rounded-xl border border-border2 shadow-sm h-64">
        <h3 className="text-sm text-ink3 mb-4">Practitioner Performance</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.practitionerPerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="patients" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-surface p-4 rounded-xl border border-border2 shadow-sm h-64">
        <h3 className="text-sm text-ink3 mb-4">Procedure Mix</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.procedureMix}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {data.procedureMix.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
