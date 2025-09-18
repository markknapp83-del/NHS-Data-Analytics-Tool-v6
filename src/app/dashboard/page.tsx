'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNHSData } from '@/hooks/use-nhs-data';
import { useTrustSelection } from '@/hooks/use-trust-selection';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { RTTPerformanceChart } from '@/components/charts/rtt-performance-chart';
import { WaitingListChart } from '@/components/charts/waiting-list-chart';
import { AverageWaitChart } from '@/components/charts/average-wait-chart';
import { BreachBreakdownChart } from '@/components/charts/breach-breakdown-chart';

export default function OverviewPage() {
  const { getTrustData, isLoading } = useNHSData();
  const [selectedTrust] = useTrustSelection();
  const trustData = getTrustData(selectedTrust);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!trustData.length) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-slate-600">
            No performance data found for the selected trust. Please select a different trust or check data availability.
          </p>
        </div>
      </div>
    );
  }

  // Find the latest record that has complete data
  const latestDataComplete = [...trustData].reverse().find(record =>
    (record.trust_total_percent_within_18_weeks !== null && record.trust_total_percent_within_18_weeks !== undefined) ||
    (record.ae_4hr_performance_pct !== null && record.ae_4hr_performance_pct !== undefined)
  );

  const latestData = latestDataComplete || trustData[trustData.length - 1];

  // Find previous record with complete data for trend calculation
  const previousDataComplete = [...trustData].reverse().slice(1).find(record =>
    (record.trust_total_percent_within_18_weeks !== null && record.trust_total_percent_within_18_weeks !== undefined) ||
    (record.ae_4hr_performance_pct !== null && record.ae_4hr_performance_pct !== undefined)
  );

  const previousData = previousDataComplete;

  const calculateTrend = (current: number, previous: number) => {
    if (!previous) return { change: 0, direction: 'neutral' as const };
    const change = ((current - previous) / previous) * 100;
    return {
      change: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral' as const
    };
  };

  const getPerformanceColor = (value: number, target: number, inverse = false) => {
    const ratio = value / target;
    if (inverse) {
      return ratio <= 1 ? 'text-green-600' : ratio <= 1.5 ? 'text-yellow-600' : 'text-red-600';
    }
    return ratio >= 1 ? 'text-green-600' : ratio >= 0.8 ? 'text-yellow-600' : 'text-red-600';
  };

  const TrendIcon = ({ direction }: { direction: 'up' | 'down' | 'neutral' }) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-slate-400" />;
    }
  };

  const kpiCards = [
    {
      title: 'RTT 18-week Compliance',
      value: latestData.trust_total_percent_within_18_weeks, // Already stored as percentage
      previousValue: previousData?.trust_total_percent_within_18_weeks,
      target: 92,
      format: 'percentage',
      description: 'Target: 92%',
      inverse: false
    },
    {
      title: '52+ Week Waiters',
      value: latestData.trust_total_total_52_plus_weeks,
      previousValue: previousData?.trust_total_total_52_plus_weeks,
      target: 0,
      format: 'number',
      description: 'Should be zero',
      inverse: true
    },
    {
      title: 'Total Waiting List',
      value: latestData.trust_total_total_incomplete_pathways,
      previousValue: previousData?.trust_total_total_incomplete_pathways,
      format: 'number',
      description: 'Incomplete pathways'
    },
    {
      title: 'A&E 4-hour Performance',
      value: latestData.ae_4hr_performance_pct, // Already stored as percentage
      previousValue: previousData?.ae_4hr_performance_pct,
      target: 95,
      format: 'percentage',
      description: 'Target: 95%',
      inverse: false
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Performance Overview</h1>
          <p className="text-slate-600">
            Key performance indicators and trend analysis for NHS trust operations
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Latest: {new Date(latestData.period).toLocaleDateString('en-GB', {
            month: 'long',
            year: 'numeric'
          })}
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => {
          const trend = kpi.previousValue ? calculateTrend(kpi.value, kpi.previousValue) : null;
          const performanceColor = kpi.target ?
            getPerformanceColor(kpi.value, kpi.target, kpi.inverse) :
            'text-slate-900';

          return (
            <Card key={kpi.title}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">{kpi.title}</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-bold ${performanceColor}`}>
                      {kpi.format === 'percentage'
                        ? `${kpi.value?.toFixed(1)}%`
                        : kpi.value?.toLocaleString() || '0'
                      }
                    </p>
                    {trend && (
                      <div className="flex items-center gap-1">
                        <TrendIcon direction={trend.direction as 'up' | 'down' | 'neutral'} />
                        <span className="text-sm text-slate-600">
                          {trend.change.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{kpi.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart Grid Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>RTT Performance Trend</CardTitle>
            <CardDescription>18-week compliance over time with 92% NHS standard</CardDescription>
          </CardHeader>
          <CardContent>
            <RTTPerformanceChart data={trustData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Waiting List Volume</CardTitle>
            <CardDescription>Total incomplete pathways by month</CardDescription>
          </CardHeader>
          <CardContent>
            <WaitingListChart data={trustData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Wait Time</CardTitle>
            <CardDescription>Median waiting time in weeks with trend analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <AverageWaitChart data={trustData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Long Wait Breakdown</CardTitle>
            <CardDescription>52+, 65+, and 78+ week breach categories</CardDescription>
          </CardHeader>
          <CardContent>
            <BreachBreakdownChart data={trustData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}