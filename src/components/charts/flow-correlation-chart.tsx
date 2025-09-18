'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { NHSTrustData } from '@/types/nhs-data';

interface FlowCorrelationChartProps {
  data: NHSTrustData[];
}

export function FlowCorrelationChart({ data }: FlowCorrelationChartProps) {
  const chartData = data
    .filter(record => record.ae_4hr_performance_pct !== null && record.virtual_ward_occupancy_rate !== null)
    .map(record => ({
      period: new Date(record.period).toLocaleDateString('en-GB', {
        month: 'short',
        year: '2-digit'
      }),
      aePerformance: record.ae_4hr_performance_pct,
      virtualWardOccupancy: record.virtual_ward_occupancy_rate || 0,
      discharges: record.avg_daily_discharges || 0
    }))
    .slice(-12); // Last 12 months

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value, name) => [
            name === 'aePerformance' ? `${Number(value).toFixed(1)}%` :
            name === 'virtualWardOccupancy' ? `${Number(value).toFixed(1)}%` :
            `${Number(value).toFixed(0)}`,
            name === 'aePerformance' ? 'A&E 4hr Performance' :
            name === 'virtualWardOccupancy' ? 'Virtual Ward Occupancy' :
            'Daily Discharges'
          ]}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="aePerformance"
          stroke="#dc2626"
          strokeWidth={2}
          name="A&E 4hr Performance %"
        />
        <Line
          type="monotone"
          dataKey="virtualWardOccupancy"
          stroke="#2563eb"
          strokeWidth={2}
          name="Virtual Ward Occupancy %"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}