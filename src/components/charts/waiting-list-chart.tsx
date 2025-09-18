'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { NHSTrustData } from '@/types/nhs-data';

interface WaitingListChartProps {
  data: NHSTrustData[];
}

export function WaitingListChart({ data }: WaitingListChartProps) {
  const chartData = data.map(record => ({
    period: new Date(record.period).toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric'
    }),
    totalWaiting: record.trust_total_total_incomplete_pathways || 0,
    within18Weeks: record.trust_total_total_within_18_weeks || 0,
    over18Weeks: (record.trust_total_total_incomplete_pathways || 0) - (record.trust_total_total_within_18_weeks || 0)
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 12 }}
          stroke="#64748b"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#64748b"
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            value.toLocaleString(),
            name === 'within18Weeks' ? 'Within 18 weeks' :
            name === 'over18Weeks' ? 'Over 18 weeks' : 'Total Waiting'
          ]}
          labelStyle={{ color: '#334155' }}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <Area
          type="monotone"
          dataKey="within18Weeks"
          stackId="1"
          stroke="#22c55e"
          fill="#22c55e"
          fillOpacity={0.8}
        />
        <Area
          type="monotone"
          dataKey="over18Weeks"
          stackId="1"
          stroke="#ef4444"
          fill="#ef4444"
          fillOpacity={0.8}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}