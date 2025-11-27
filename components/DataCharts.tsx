import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { InventoryItem } from '../types';

interface ChartProps {
  data: InventoryItem[];
}

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
const STATUS_COLORS = {
  'In Stock': '#22c55e', // Green
  'Low Stock': '#eab308', // Yellow
  'Out of Stock': '#ef4444', // Red
  'Overstock': '#3b82f6', // Blue
};

export const CategoryValueChart: React.FC<ChartProps> = ({ data }) => {
  // Aggregate value by category
  const categoryData = data.reduce((acc, item) => {
    const existing = acc.find(c => c.name === item.category);
    if (existing) {
      existing.value += item.value;
    } else {
      acc.push({ name: item.category, value: item.value });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="h-[300px] w-full">
      <h4 className="text-sm font-medium text-slate-500 mb-4 text-center">Стоимость запасов по категориям</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={categoryData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const StatusDistributionChart: React.FC<ChartProps> = ({ data }) => {
  const statusData = data.reduce((acc, item) => {
    const existing = acc.find(s => s.name === item.status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.status, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="h-[300px] w-full">
      <h4 className="text-sm font-medium text-slate-500 mb-4 text-center">Распределение статусов запасов</h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={statusData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
