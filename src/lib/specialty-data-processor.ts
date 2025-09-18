import { NHSTrustData, InteractiveSpecialtyData, BreachData, PerformanceLevel } from '@/types/nhs-data';

export function getSpecialtiesData(trustData: NHSTrustData): InteractiveSpecialtyData[] {
  const specialties = [
    { key: 'general_surgery', name: 'General Surgery', code: '100' },
    { key: 'urology', name: 'Urology', code: '101' },
    { key: 'trauma_orthopaedics', name: 'Trauma & Orthopaedics', code: '110' },
    { key: 'ent', name: 'ENT', code: '120' },
    { key: 'ophthalmology', name: 'Ophthalmology', code: '130' },
    { key: 'oral_surgery', name: 'Oral Surgery', code: '140' },
    { key: 'restorative_dentistry', name: 'Restorative Dentistry', code: '141' },
    { key: 'pediatric_surgery', name: 'Paediatric Surgery', code: '170' },
    { key: 'cardiothoracic_surgery', name: 'Cardiothoracic Surgery', code: '180' },
    { key: 'general_medicine', name: 'General Internal Medicine', code: '300' },
    { key: 'gastroenterology', name: 'Gastroenterology', code: '301' },
    { key: 'cardiology', name: 'Cardiology', code: '320' },
    { key: 'dermatology', name: 'Dermatology', code: '330' },
    { key: 'respiratory_medicine', name: 'Respiratory Medicine', code: '340' },
    { key: 'neurology', name: 'Neurology', code: '400' },
    { key: 'rheumatology', name: 'Rheumatology', code: '410' },
    { key: 'geriatric_medicine', name: 'Geriatric Medicine', code: '430' },
    { key: 'gynecology', name: 'Gynaecology', code: '500' },
    { key: 'other_surgery', name: 'Other Surgery', code: '800' },
    { key: 'medical_oncology', name: 'Medical Oncology', code: '370' }
  ];

  return specialties.map(specialty => {
    const percentage = (trustData as any)[`rtt_${specialty.key}_percent_within_18_weeks`] as number;
    const within18weeks = (trustData as any)[`rtt_${specialty.key}_total_within_18_weeks`] as number;
    const total = (trustData as any)[`rtt_${specialty.key}_total_incomplete_pathways`] as number;

    return {
      ...specialty,
      percentage: percentage ? percentage * 100 : 0, // Convert decimal to percentage
      within18weeks: within18weeks || 0,
      total: total || 0
    };
  }).filter(specialty => specialty.total > 0); // Only show specialties with data
}

export function getSpecialtyBreachData(trustData: NHSTrustData, specialtyKey: string): BreachData {
  if (specialtyKey === 'trust_total') {
    return {
      week52Plus: trustData.trust_total_total_52_plus_weeks || 0,
      week65Plus: trustData.trust_total_total_65_plus_weeks || 0,
      week78Plus: trustData.trust_total_total_78_plus_weeks || 0
    };
  }

  return {
    week52Plus: (trustData as any)[`rtt_${specialtyKey}_total_52_plus_weeks`] as number || 0,
    week65Plus: (trustData as any)[`rtt_${specialtyKey}_total_65_plus_weeks`] as number || 0,
    week78Plus: (trustData as any)[`rtt_${specialtyKey}_total_78_plus_weeks`] as number || 0
  };
}

export function getSpecialtyDisplayName(specialtyKey: string): string {
  if (specialtyKey === 'trust_total') return 'All Specialties';

  const specialtyMap: Record<string, string> = {
    'general_surgery': 'General Surgery',
    'urology': 'Urology',
    'trauma_orthopaedics': 'Trauma & Orthopaedics',
    'ent': 'ENT',
    'ophthalmology': 'Ophthalmology',
    'oral_surgery': 'Oral Surgery',
    'restorative_dentistry': 'Restorative Dentistry',
    'pediatric_surgery': 'Paediatric Surgery',
    'cardiothoracic_surgery': 'Cardiothoracic Surgery',
    'general_medicine': 'General Internal Medicine',
    'gastroenterology': 'Gastroenterology',
    'cardiology': 'Cardiology',
    'dermatology': 'Dermatology',
    'respiratory_medicine': 'Respiratory Medicine',
    'neurology': 'Neurology',
    'rheumatology': 'Rheumatology',
    'geriatric_medicine': 'Geriatric Medicine',
    'gynecology': 'Gynaecology',
    'other_surgery': 'Other Surgery',
    'medical_oncology': 'Medical Oncology'
  };

  return specialtyMap[specialtyKey] || specialtyKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

export function getPerformanceLevel(percentage: number): PerformanceLevel {
  if (percentage >= 92) return { label: 'Excellent', variant: 'default', color: 'bg-green-500' };
  if (percentage >= 75) return { label: 'Good', variant: 'secondary', color: 'bg-green-400' };
  if (percentage >= 50) return { label: 'Concern', variant: 'secondary', color: 'bg-yellow-400' };
  return { label: 'Critical', variant: 'destructive', color: 'bg-red-500' };
}