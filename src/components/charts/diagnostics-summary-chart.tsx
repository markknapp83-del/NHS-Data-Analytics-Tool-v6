'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { NHSTrustData } from '@/types/nhs-data';

interface DiagnosticsSummaryChartProps {
  data: NHSTrustData[];
}

export function DiagnosticsSummaryChart({ data }: DiagnosticsSummaryChartProps) {
  const latestData = data[data.length - 1];

  const diagnosticTypes = [
    { key: 'mri', name: 'MRI' },
    { key: 'ct', name: 'CT Scan' },
    { key: 'ultrasound', name: 'Ultrasound' },
    { key: 'echocardiography', name: 'Echo' },
    { key: 'gastroscopy', name: 'Gastroscopy' },
    { key: 'colonoscopy', name: 'Colonoscopy' }
  ];

  const chartData = diagnosticTypes.map(type => {
    const totalWaiting = (latestData as any)[`diag_${type.key}_total_waiting`] || 0;
    const sixWeekBreaches = (latestData as any)[`diag_${type.key}_6week_breaches`] || 0;
    const breachRate = totalWaiting > 0 ? (sixWeekBreaches / totalWaiting) * 100 : 0;

    return {
      name: type.name,
      totalWaiting,
      breachRate: breachRate,
      sixWeekBreaches
    };
  }).filter(item => item.totalWaiting > 0);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          stroke="#64748b"
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#64748b"
          label={{ value: 'Breach Rate (%)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            name === 'breachRate' ? `${value.toFixed(1)}%` : value.toLocaleString(),
            name === 'breachRate' ? 'Breach Rate' :
            name === 'totalWaiting' ? 'Total Waiting' : 'Breaches'
          ]}
          labelStyle={{ color: '#334155' }}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        />
        <Bar
          dataKey="breachRate"
          fill="#f59e0b"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}