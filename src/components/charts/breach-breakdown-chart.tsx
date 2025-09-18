'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { NHSTrustData } from '@/types/nhs-data';

interface BreachBreakdownChartProps {
  data: NHSTrustData[];
  selectedSpecialty?: string;
}

export function BreachBreakdownChart({ data, selectedSpecialty = 'trust_total' }: BreachBreakdownChartProps) {
  // Build field names based on selected specialty
  const getFieldName = (suffix: string) => {
    return selectedSpecialty === 'trust_total'
      ? `trust_total_${suffix}`
      : `rtt_${selectedSpecialty}_${suffix}`;
  };

  const weeks52Field = getFieldName('total_52_plus_weeks');
  const weeks65Field = getFieldName('total_65_plus_weeks');
  const weeks78Field = getFieldName('total_78_plus_weeks');

  const chartData = data.map(record => ({
    period: new Date(record.period).toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric'
    }),
    '52+ weeks': record[weeks52Field] || 0,
    '65+ weeks': record[weeks65Field] || 0,
    '78+ weeks': record[weeks78Field] || 0
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 12 }}
          stroke="#64748b"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#64748b"
          label={{ value: 'Patients', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            value.toLocaleString(),
            name
          ]}
          labelStyle={{ color: '#334155' }}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar
          dataKey="52+ weeks"
          fill="#f59e0b"
          name="52+ weeks"
          radius={[2, 2, 0, 0]}
        />
        <Bar
          dataKey="65+ weeks"
          fill="#ef4444"
          name="65+ weeks"
          radius={[2, 2, 0, 0]}
        />
        <Bar
          dataKey="78+ weeks"
          fill="#dc2626"
          name="78+ weeks"
          radius={[2, 2, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}