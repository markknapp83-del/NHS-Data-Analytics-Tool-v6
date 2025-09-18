'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { NHSTrustData } from '@/../types/nhs-data';

export function DiagnosticBreachBreakdownChart({ data }: { data: NHSTrustData[] }) {
  const chartData = useMemo(() => {
    return data.map(monthData => {
      const diagnosticTypes = ['mri', 'ct', 'ultrasound', 'gastroscopy', 'echocardiography'];

      let total6WeekBreaches = 0;
      let total13WeekBreaches = 0;
      let totalWaiting = 0;

      diagnosticTypes.forEach(type => {
        const waiting = monthData[`diag_${type}_total_waiting` as keyof NHSTrustData] as number || 0;
        const sixWeek = monthData[`diag_${type}_6week_breaches` as keyof NHSTrustData] as number || 0;
        const thirteenWeek = monthData[`diag_${type}_13week_breaches` as keyof NHSTrustData] as number || 0;

        totalWaiting += waiting;
        total6WeekBreaches += sixWeek;
        total13WeekBreaches += thirteenWeek;
      });

      return {
        period: format(new Date(monthData.period), 'MMM yyyy'),
        month: monthData.period,
        '6+ weeks': total6WeekBreaches,
        '13+ weeks': total13WeekBreaches,
        'Within target': totalWaiting - total6WeekBreaches,
        totalWaiting
      };
    }).filter(item => item.totalWaiting > 0);
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <p className="text-slate-500">No diagnostic data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            fontSize={12}
            tick={{ fill: '#64748b' }}
          />
          <YAxis
            fontSize={12}
            tick={{ fill: '#64748b' }}
            label={{ value: 'Patients', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '6px'
            }}
            formatter={(value: number, name: string) => [
              value.toLocaleString(),
              name
            ]}
          />
          <Legend />
          <Bar
            dataKey="Within target"
            stackId="diagnostic"
            fill="#10b981"
            name="Within 6 weeks"
          />
          <Bar
            dataKey="6+ weeks"
            stackId="diagnostic"
            fill="#f59e0b"
            name="6-13 week waits"
          />
          <Bar
            dataKey="13+ weeks"
            stackId="diagnostic"
            fill="#ef4444"
            name="13+ week waits"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}