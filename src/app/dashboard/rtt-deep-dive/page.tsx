'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNHSData } from '@/hooks/use-nhs-data';
import { useTrustSelection } from '@/hooks/use-trust-selection';
import { AlertTriangle } from 'lucide-react';
import { RTTTrendsTab } from '@/components/dashboard/rtt-trends-tab';
import { SpecialtyAnalysisTab } from '@/components/dashboard/specialty-analysis-tab';

export default function RTTDeepDivePage() {
  const { getTrustData, isLoading } = useNHSData();
  const [selectedTrust] = useTrustSelection();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('trust_total');
  const trustData = getTrustData(selectedTrust);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
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
          <h3 className="text-lg font-semibold mb-2">No RTT Data Available</h3>
          <p className="text-slate-600">
            No RTT performance data found for the selected trust.
          </p>
        </div>
      </div>
    );
  }

  const latestData = trustData[trustData.length - 1];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">RTT Deep Dive Analysis</h1>
          <p className="text-slate-600">Comprehensive Referral to Treatment performance analysis</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Data: {new Date(latestData.period).toLocaleDateString('en-GB', {
            month: 'long',
            year: 'numeric'
          })}
        </Badge>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="specialties">Specialty Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <RTTTrendsTab />
        </TabsContent>

        <TabsContent value="specialties">
          <SpecialtyAnalysisTab
            selectedSpecialty={selectedSpecialty}
            onSpecialtySelect={setSelectedSpecialty}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}