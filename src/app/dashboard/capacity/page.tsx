'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNHSData } from '@/hooks/use-nhs-data';
import { useTrustSelection } from '@/hooks/use-trust-selection';
import { Building2, Bed, Users } from 'lucide-react';
import { AEPerformanceTrendChart } from '@/components/charts/ae-performance-trend-chart';
import { VirtualWardChart } from '@/components/charts/virtual-ward-chart';
import { FlowCorrelationChart } from '@/components/charts/flow-correlation-chart';
import { DischargePatternChart } from '@/components/charts/discharge-pattern-chart';

export default function CapacityFlowPage() {
  const { getTrustData, isLoading } = useNHSData();
  const [selectedTrust] = useTrustSelection();
  const trustData = getTrustData(selectedTrust);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
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
          <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-slate-600">
            No capacity data found for the selected trust.
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Capacity & Flow Intelligence</h1>
          <p className="text-slate-600">
            Emergency department performance, virtual ward utilization, and patient flow analytics
          </p>
        </div>
      </div>

      {/* Virtual Ward KPI Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Virtual Ward Capacity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold">
                {latestData.virtual_ward_capacity || 'N/A'}
              </div>
              <div className="text-xs text-slate-600">Virtual Ward Beds</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-blue-600">
                {latestData.virtual_ward_occupancy_rate?.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-600">VW Occupancy</div>
              <div className="text-xs text-slate-500">Target: 85%</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold">
                {latestData.avg_daily_discharges?.toFixed(0)}
              </div>
              <div className="text-xs text-slate-600">Daily Discharges</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Virtual Ward Utilization Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Virtual Ward Utilization</CardTitle>
          <CardDescription>Current capacity utilization and efficiency metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Occupancy Rate</span>
                  <span className="text-sm text-slate-600">
                    {((latestData.virtual_ward_occupancy_rate || 0) * 100).toFixed(1)}% / 85% optimal
                  </span>
                </div>
                <Progress
                  value={Math.min((latestData.virtual_ward_occupancy_rate || 0) * 100, 100)}
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Bed Utilization</span>
                  <span className="text-sm text-slate-600">
                    {Math.round((latestData.virtual_ward_occupancy_rate || 0) * (latestData.virtual_ward_capacity || 0))} occupied
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#005eb8]">
                  {latestData.virtual_ward_capacity || 0} total beds
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-700 mb-1">Available Beds</h4>
                <p className="text-xl font-bold text-green-600">
                  {Math.round((latestData.virtual_ward_capacity || 0) * (1 - (latestData.virtual_ward_occupancy_rate || 0)))}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-700 mb-1">Daily Turnover</h4>
                <p className="text-xl font-bold text-blue-600">
                  {latestData.avg_daily_discharges?.toFixed(1) || '0'}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-700 mb-1">Efficiency Rate</h4>
                <p className="text-xl font-bold text-purple-600">
                  {((latestData.avg_daily_discharges || 0) / (latestData.virtual_ward_capacity || 1) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discharge Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Discharge Efficiency</CardTitle>
            <CardDescription>Daily discharge patterns and capacity turnover</CardDescription>
          </CardHeader>
          <CardContent>
            <DischargePatternChart data={trustData} />
          </CardContent>
        </Card>

        {/* Virtual Ward Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Virtual Ward Utilization</CardTitle>
            <CardDescription>Occupancy rate and efficiency metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <VirtualWardChart data={trustData} />
          </CardContent>
        </Card>
      </div>

      {/* A&E Performance KPI Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Emergency Department Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-red-600">
                {latestData.ae_4hr_performance_pct !== null && latestData.ae_4hr_performance_pct !== undefined
                  ? `${latestData.ae_4hr_performance_pct.toFixed(1)}%`
                  : 'N/A'}
              </div>
              <div className="text-xs text-slate-600">4-Hour Performance</div>
              <div className="text-xs text-slate-500">Target: 95%</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold">
                {latestData.ae_attendances_total !== null && latestData.ae_attendances_total !== undefined
                  ? latestData.ae_attendances_total.toLocaleString()
                  : 'N/A'}
              </div>
              <div className="text-xs text-slate-600">Total Attendances</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-orange-600">
                {latestData.ae_over_4hrs_total !== null && latestData.ae_over_4hrs_total !== undefined
                  ? latestData.ae_over_4hrs_total.toLocaleString()
                  : 'N/A'}
              </div>
              <div className="text-xs text-slate-600">Over 4 Hours</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold text-red-600">
                {latestData.ae_12hr_wait_admissions !== null && latestData.ae_12hr_wait_admissions !== undefined
                  ? latestData.ae_12hr_wait_admissions.toLocaleString()
                  : 'N/A'}
              </div>
              <div className="text-xs text-slate-600">12-Hour Waits</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* A&E Performance Trend - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle>A&E Performance Trend</CardTitle>
          <CardDescription>4-hour performance over time with 95% NHS standard</CardDescription>
        </CardHeader>
        <CardContent>
          <AEPerformanceTrendChart data={trustData} />
        </CardContent>
      </Card>
    </div>
  );
}