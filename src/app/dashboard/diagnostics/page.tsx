'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNHSData } from '@/hooks/use-nhs-data';
import { useTrustSelection } from '@/hooks/use-trust-selection';
import { extractDiagnosticData } from '@/lib/diagnostic-data-processor';
import { rankDiagnosticsByOpportunity } from '@/lib/diagnostic-intelligence';
import { EnhancedDiagnosticCard } from '@/components/dashboard/enhanced-diagnostic-card';
import { DiagnosticBreachChart } from '@/components/charts/diagnostic-breach-chart';
import { DiagnosticScatterChart } from '@/components/charts/diagnostic-scatter-chart';

export default function DiagnosticsPage() {
  const { getTrustData, isLoading } = useNHSData();
  const [selectedTrust] = useTrustSelection();
  const trustData = getTrustData(selectedTrust);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const diagnosticServices = useMemo(() => {
    if (!trustData.length) return [];
    const latestData = trustData[trustData.length - 1];
    const services = extractDiagnosticData(latestData);
    return rankDiagnosticsByOpportunity(services);
  }, [trustData]);

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
          <h3 className="text-lg font-semibold mb-2">No Diagnostic Data Available</h3>
          <p className="text-slate-600">
            No diagnostic performance data found for the selected trust.
          </p>
        </div>
      </div>
    );
  }

  const latestData = trustData[trustData.length - 1];

  // Get selected service data or aggregate data
  const selectedServiceData = selectedService
    ? diagnosticServices.find(s => s.type === selectedService)
    : null;

  const displayData = selectedServiceData ? {
    totalWaiting: selectedServiceData.totalWaiting,
    sixWeekBreaches: selectedServiceData.sixWeekBreaches,
    thirteenWeekBreaches: selectedServiceData.thirteenWeekBreaches,
    breachRate: selectedServiceData.breachRate,
    name: selectedServiceData.name
  } : {
    totalWaiting: diagnosticServices.reduce((sum, s) => sum + s.totalWaiting, 0),
    sixWeekBreaches: diagnosticServices.reduce((sum, s) => sum + s.sixWeekBreaches, 0),
    thirteenWeekBreaches: diagnosticServices.reduce((sum, s) => sum + s.thirteenWeekBreaches, 0),
    breachRate: diagnosticServices.length > 0 ?
      ((diagnosticServices.reduce((sum, s) => sum + s.sixWeekBreaches, 0) /
        diagnosticServices.reduce((sum, s) => sum + s.totalWaiting, 0)) * 100)
      : 0,
    name: 'All Services'
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Diagnostic Services Performance</h1>
          <p className="text-slate-600">
            Waiting times and breach analysis across all diagnostic modalities - ranked by insourcing opportunity
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {diagnosticServices.length} diagnostic services monitored
        </Badge>
      </div>

      {/* Dynamic KPI Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Performance Summary:</h3>
          <Badge variant="outline" className="text-sm">
            {displayData.name}
          </Badge>
          {selectedService && (
            <button
              onClick={() => setSelectedService(null)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              View All Services
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-slate-800">
                {displayData.totalWaiting.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600">Total Patients Waiting</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {displayData.sixWeekBreaches.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600">6+ Week Breaches</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-600">
                {displayData.thirteenWeekBreaches.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600">13+ Week Breaches</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-600">
                {displayData.breachRate.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">Overall Breach Rate</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enhanced Diagnostic Services */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Diagnostic Service Analysis</h3>
          <Badge variant="secondary" className="text-xs">
            Ranked by insourcing opportunity
          </Badge>
          <p className="text-sm text-slate-600">
            Click any service to view detailed metrics
          </p>
        </div>

        <div className="space-y-3">
          {diagnosticServices.map((service) => (
            <div
              key={service.type}
              onClick={() => setSelectedService(service.type)}
              className="cursor-pointer"
            >
              <EnhancedDiagnosticCard
                service={service}
                data={service}
                isSelected={selectedService === service.type}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Additional Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Breach Rate Comparison</CardTitle>
            <CardDescription>6+ week breach rates across all diagnostic services</CardDescription>
          </CardHeader>
          <CardContent>
            <DiagnosticBreachChart data={diagnosticServices} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume vs. Performance</CardTitle>
            <CardDescription>Waiting list size vs. breach rate analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <DiagnosticScatterChart data={diagnosticServices} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}