'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { NHSTrustData } from '@/types/nhs-data';

interface AverageWaitChartProps {
  data: NHSTrustData[];
  selectedSpecialty?: string;
}

export function AverageWaitChart({ data, selectedSpecialty = 'trust_total' }: AverageWaitChartProps) {
  // Build field name based on selected specialty
  const getFieldName = (suffix: string) => {
    return selectedSpecialty === 'trust_total'
      ? `trust_total_${suffix}`
      : `rtt_${selectedSpecialty}_${suffix}`;
  };

  const medianWaitField = getFieldName('median_wait_weeks');

  const chartData = data.map(record => ({
    period: new Date(record.period).toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric'
    }),
    medianWait: record[medianWaitField] || 0
  }));

  const maxWait = Math.max(...chartData.map(d => d.medianWait));
  const yAxisMax = Math.ceil(maxWait * 1.1);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 12 }}
          stroke="#64748b"
        />
        <YAxis
          domain={[0, yAxisMax]}
          tick={{ fontSize: 12 }}
          stroke="#64748b"
          label={{ value: 'Weeks', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(1)} weeks`, 'Median Wait Time']}
          labelStyle={{ color: '#334155' }}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <Line
          type="monotone"
          dataKey="medianWait"
          stroke="#0ea5e9"
          strokeWidth={3}
          dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#0ea5e9', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}