import { useMemo } from 'react';
import { useNHSData } from '@/hooks/use-nhs-data';
import { useTrustSelection } from '@/hooks/use-trust-selection';
import { DynamicBreachCards } from './dynamic-breach-cards';
import { InteractiveSpecialtyCard } from './interactive-specialty-card';
import { getSpecialtiesData, getSpecialtyBreachData, getSpecialtyDisplayName } from '@/lib/specialty-data-processor';

export function SpecialtyAnalysisTab({
  selectedSpecialty,
  onSpecialtySelect
}: {
  selectedSpecialty: string;
  onSpecialtySelect: (specialty: string) => void;
}) {
  const { getTrustData } = useNHSData();
  const [selectedTrust] = useTrustSelection();
  const trustData = getTrustData(selectedTrust);
  const latestData = trustData[trustData.length - 1];

  // Get and rank specialties by performance (worst first)
  const rankedSpecialties = useMemo(() => {
    if (!latestData) return [];
    const specialties = getSpecialtiesData(latestData);
    return specialties.sort((a, b) => a.percentage - b.percentage); // Ascending = worst first
  }, [latestData]);

  // Get breach data for selected specialty
  const selectedSpecialtyData = useMemo(() => {
    if (!latestData) return { week52Plus: 0, week65Plus: 0, week78Plus: 0 };
    return getSpecialtyBreachData(latestData, selectedSpecialty);
  }, [latestData, selectedSpecialty]);

  if (!trustData.length || !latestData) {
    return <div>Loading trust data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Breach Cards - Update based on selected specialty */}
      <DynamicBreachCards
        data={selectedSpecialtyData}
        specialtyName={getSpecialtyDisplayName(selectedSpecialty)}
      />

      {/* Specialty Performance Cards - Ranked worst to best */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Specialty Performance Ranking</h3>
          <p className="text-sm text-slate-600">Click specialty to view detailed breach analysis</p>
        </div>

        <div className="space-y-2">
          {rankedSpecialties.map((specialty, index) => (
            <InteractiveSpecialtyCard
              key={specialty.key}
              specialty={specialty}
              rank={index + 1}
              isSelected={selectedSpecialty === specialty.key}
              onClick={() => onSpecialtySelect(specialty.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}