'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNHSData } from '@/hooks/use-nhs-data';
import { useTrustSelection } from '@/hooks/use-trust-selection';
import { Activity, Clock, Users, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { AEPerformanceChart } from '@/components/charts/ae-performance-chart';
import { DiagnosticsSummaryChart } from '@/components/charts/diagnostics-summary-chart';

export default function OperationalPage() {
  const { getTrustData, isLoading } = useNHSData();
  const [selectedTrust] = useTrustSelection();
  const trustData = getTrustData(selectedTrust);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
          <h3 className="text-lg font-semibold mb-2">No Operational Data Available</h3>
          <p className="text-slate-600">
            No operational performance data found for the selected trust.
          </p>
        </div>
      </div>
    );
  }

  // Find the latest record that has A&E data
  const latestDataWithAE = [...trustData].reverse().find(record =>
    record.ae_4hr_performance_pct !== null &&
    record.ae_4hr_performance_pct !== undefined &&
    record.ae_attendances_total !== null &&
    record.ae_attendances_total !== undefined
  );

  const latestData = latestDataWithAE || trustData[trustData.length - 1];

  // Find previous record with A&E data for trend calculation
  const previousDataWithAE = [...trustData].reverse().slice(1).find(record =>
    record.ae_4hr_performance_pct !== null &&
    record.ae_4hr_performance_pct !== undefined &&
    record.ae_attendances_total !== null &&
    record.ae_attendances_total !== undefined
  );

  const previousData = previousDataWithAE;

  // A&E Performance Metrics
  const aeMetrics = [
    {
      title: 'A&E 4-hour Performance',
      value: latestData.ae_4hr_performance_pct || 0, // Already stored as percentage
      previousValue: previousData?.ae_4hr_performance_pct,
      target: 95,
      format: 'percentage',
      icon: Clock,
      description: 'Target: 95%'
    },
    {
      title: 'Total Attendances',
      value: latestData.ae_attendances_total || 0,
      previousValue: previousData?.ae_attendances_total,
      format: 'number',
      icon: Users,
      description: 'Monthly attendances'
    },
    {
      title: 'Over 4 Hours',
      value: latestData.ae_over_4hrs_total || 0,
      previousValue: previousData?.ae_over_4hrs_total,
      format: 'number',
      icon: AlertTriangle,
      description: 'Breached 4-hour target'
    },
    {
      title: 'Emergency Admissions',
      value: latestData.ae_emergency_admissions_total || 0,
      previousValue: previousData?.ae_emergency_admissions_total,
      format: 'number',
      icon: Activity,
      description: 'Admitted via A&E'
    }
  ];

  // Diagnostics types - simplified list based on common NHS diagnostics
  const diagnosticTypes = [
    { key: 'mri', name: 'MRI' },
    { key: 'ct', name: 'CT Scan' },
    { key: 'ultrasound', name: 'Ultrasound' },
    { key: 'nuclear_medicine', name: 'Nuclear Medicine' },
    { key: 'echocardiography', name: 'Echocardiography' },
    { key: 'gastroscopy', name: 'Gastroscopy' },
    { key: 'colonoscopy', name: 'Colonoscopy' },
    { key: 'cystoscopy', name: 'Cystoscopy' }
  ];

  const calculateTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      change: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : 'down' as const,
      isPositive: change > 0
    };
  };

  const getPerformanceColor = (value: number, target: number) => {
    const ratio = value / target;
    if (ratio >= 1) return 'text-green-600';
    if (ratio >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Operational Performance</h1>
          <p className="text-slate-600">
            Emergency department and diagnostic service performance analysis
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Data: {new Date(latestData.period).toLocaleDateString('en-GB', {
            month: 'long',
            year: 'numeric'
          })}
        </Badge>
      </div>

      {/* A&E Performance Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Emergency Department Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aeMetrics.map((metric) => {
            const trend = metric.previousValue ? calculateTrend(metric.value, metric.previousValue) : null;
            const performanceColor = metric.target ?
              getPerformanceColor(metric.value, metric.target) :
              'text-slate-900';

            return (
              <Card key={metric.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className="h-5 w-5 text-[#005eb8]" />
                    {trend && (
                      <div className="flex items-center gap-1">
                        {trend.direction === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm text-slate-600">{trend.change}%</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                    <p className={`text-2xl font-bold ${performanceColor}`}>
                      {metric.format === 'percentage'
                        ? `${metric.value.toFixed(1)}%`
                        : metric.value.toLocaleString()
                      }
                    </p>
                    <p className="text-xs text-slate-500">{metric.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* A&E Performance Detail */}
      <Card>
        <CardHeader>
          <CardTitle>A&E Performance Analysis</CardTitle>
          <CardDescription>Detailed breakdown of emergency department metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">4-hour Performance</span>
                  <span className="text-sm text-slate-600">
                    {latestData.ae_4hr_performance_pct?.toFixed(1)}% / 95% target
                  </span>
                </div>
                <Progress
                  value={Math.min(latestData.ae_4hr_performance_pct || 0, 100)}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">12-hour Wait Admissions</span>
                  <span className="text-sm text-slate-600">
                    {latestData.ae_12hr_wait_admissions?.toLocaleString() || '0'}
                  </span>
                </div>
                <Badge variant={
                  (latestData.ae_12hr_wait_admissions || 0) === 0 ? 'default' : 'destructive'
                }>
                  {(latestData.ae_12hr_wait_admissions || 0) === 0 ? 'Target Met' : 'Action Required'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostics Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Services Performance</CardTitle>
          <CardDescription>Waiting times and breach analysis across diagnostic tests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {diagnosticTypes.map((type) => {
              const totalWaiting = (latestData as any)[`diag_${type.key}_total_waiting`] as number;
              const sixWeekBreaches = (latestData as any)[`diag_${type.key}_6week_breaches`] as number;
              const thirteenWeekBreaches = (latestData as any)[`diag_${type.key}_13week_breaches`] as number;

              if (!totalWaiting || totalWaiting === 0) {
                return (
                  <div key={type.key} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-500">{type.name}</h4>
                      <p className="text-sm text-slate-400">No data available</p>
                    </div>
                  </div>
                );
              }

              const breachRate = ((sixWeekBreaches || 0) / totalWaiting) * 100;
              const performanceLevel = breachRate < 1 ? 'excellent' : breachRate < 5 ? 'good' : breachRate < 15 ? 'concern' : 'critical';

              return (
                <div key={type.key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                  <div className="flex-1">
                    <h4 className="font-medium">{type.name}</h4>
                    <p className="text-sm text-slate-600">
                      {totalWaiting.toLocaleString()} total waiting
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex gap-4">
                      <div>
                        <p className="text-sm text-slate-600">6+ weeks</p>
                        <p className="font-semibold text-orange-600">
                          {sixWeekBreaches?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">13+ weeks</p>
                        <p className="font-semibold text-red-600">
                          {thirteenWeekBreaches?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      performanceLevel === 'excellent' ? 'default' :
                      performanceLevel === 'good' ? 'secondary' :
                      performanceLevel === 'concern' ? 'outline' : 'destructive'
                    }>
                      {breachRate.toFixed(1)}% breach rate
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>A&E Performance Trend</CardTitle>
            <CardDescription>4-hour performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <AEPerformanceChart data={trustData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagnostics Overview</CardTitle>
            <CardDescription>Waiting list summary by test type</CardDescription>
          </CardHeader>
          <CardContent>
            <DiagnosticsSummaryChart data={trustData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}