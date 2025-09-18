import { NHSTrustData, DiagnosticService } from '../types/nhs-data';

export function extractDiagnosticData(trustData: NHSTrustData): DiagnosticService[] {
  const diagnosticTypes = [
    { key: 'mri', name: 'MRI Scans' },
    { key: 'ct', name: 'CT Scans' },
    { key: 'ultrasound', name: 'Ultrasound' },
    { key: 'nuclear_medicine', name: 'Nuclear Medicine' },
    { key: 'dexa', name: 'DEXA Scans' },
    { key: 'echocardiography', name: 'Echocardiography' },
    { key: 'electrophysiology', name: 'Electrophysiology' },
    { key: 'neurophysiology', name: 'Neurophysiology' },
    { key: 'audiology', name: 'Audiology' },
    { key: 'gastroscopy', name: 'Gastroscopy' },
    { key: 'colonoscopy', name: 'Colonoscopy' },
    { key: 'sigmoidoscopy', name: 'Sigmoidoscopy' },
    { key: 'cystoscopy', name: 'Cystoscopy' },
    { key: 'urodynamics', name: 'Urodynamics' },
    { key: 'sleep_studies', name: 'Sleep Studies' }
  ];

  return diagnosticTypes.map(type => {
    const totalWaiting = (trustData as any)[`diag_${type.key}_total_waiting`] as number || 0;
    const sixWeekBreaches = (trustData as any)[`diag_${type.key}_6week_breaches`] as number || 0;
    const thirteenWeekBreaches = (trustData as any)[`diag_${type.key}_13week_breaches`] as number || 0;
    const plannedTests = (trustData as any)[`diag_${type.key}_planned_procedures`] as number || 0;
    const unscheduledTests = (trustData as any)[`diag_${type.key}_procedures_performed`] as number || 0;

    return {
      type: type.key,
      name: type.name,
      totalWaiting,
      sixWeekBreaches,
      thirteenWeekBreaches,
      breachRate: totalWaiting > 0 ? (sixWeekBreaches / totalWaiting) * 100 : 0,
      plannedTests,
      unscheduledTests
    };
  }).filter(service => service.totalWaiting > 0); // Only show services with data
}