'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { NHSTrustData } from '@/types/nhs-data';

interface RTTPerformanceChartProps {
  data: NHSTrustData[];
  selectedSpecialty?: string;
}

export function RTTPerformanceChart({ data, selectedSpecialty = 'trust_total' }: RTTPerformanceChartProps) {
  // Build field name based on selected specialty
  const getFieldName = (suffix: string) => {
    return selectedSpecialty === 'trust_total'
      ? `trust_total_${suffix}`
      : `rtt_${selectedSpecialty}_${suffix}`;
  };

  const complianceField = getFieldName('percent_within_18_weeks');

  const chartData = data.map(record => ({
    period: new Date(record.period).toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric'
    }),
    compliance: selectedSpecialty === 'trust_total'
      ? record[complianceField] // Trust total is already percentage
      : record[complianceField] * 100, // Specialty data is decimal, convert to percentage
    target: 92
  }));

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
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
          stroke="#64748b"
          label={{ value: '%', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(1)}%`, 'RTT Compliance']}
          labelStyle={{ color: '#334155' }}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <ReferenceLine
          y={92}
          stroke="#dc2626"
          strokeDasharray="5 5"
          label={{ value: "92% Target", position: "topLeft" }}
        />
        <Line
          type="monotone"
          dataKey="compliance"
          stroke="#005eb8"
          strokeWidth={3}
          dot={{ fill: '#005eb8', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#005eb8', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}