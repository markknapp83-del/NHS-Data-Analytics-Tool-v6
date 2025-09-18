import { NHSTrustData } from '@/../types/nhs-data';
import { calculateCriticalDiagnosticServices } from './critical-diagnostics-calculator';
import { Clock, AlertTriangle, Activity, Building2 } from 'lucide-react';

export interface CriticalIssue {
  category: 'RTT' | 'Diagnostic' | 'A&E' | 'Capacity';
  severity: 'Critical' | 'High' | 'Moderate';
  title: string;
  description: string;
  metric: string;
  value: number;
  target?: number;
  icon: React.ComponentType<{ className?: string }>;
}

export function identifyAllCriticalIssues(trustData: NHSTrustData): CriticalIssue[] {
  const issues: CriticalIssue[] = [];

  // RTT Critical Issues
  const rttCompliance = trustData.trust_total_percent_within_18_weeks;
  if (rttCompliance && rttCompliance < 50) {
    issues.push({
      category: 'RTT',
      severity: 'Critical',
      title: 'RTT Compliance Below 50%',
      description: 'Trust-wide RTT performance is critically low',
      metric: 'Compliance',
      value: rttCompliance,
      target: 92,
      icon: Clock
    });
  } else if (rttCompliance && rttCompliance < 75) {
    issues.push({
      category: 'RTT',
      severity: 'High',
      title: 'RTT Compliance Below Target',
      description: 'Trust-wide RTT performance significantly below 92% target',
      metric: 'Compliance',
      value: rttCompliance,
      target: 92,
      icon: Clock
    });
  }

  // 52+ week waiters
  const longWaiters = trustData.trust_total_total_52_plus_weeks;
  if (longWaiters && longWaiters > 100) {
    issues.push({
      category: 'RTT',
      severity: longWaiters > 500 ? 'Critical' : 'High',
      title: 'Excessive Long Wait Patients',
      description: `${longWaiters.toLocaleString()} patients waiting over 52 weeks`,
      metric: '52+ week waiters',
      value: longWaiters,
      target: 0,
      icon: AlertTriangle
    });
  }

  // Diagnostic Critical Issues
  const criticalDiagnostics = calculateCriticalDiagnosticServices(trustData);
  criticalDiagnostics.services.forEach(service => {
    issues.push({
      category: 'Diagnostic',
      severity: service.breachRate > 25 ? 'Critical' : 'High',
      title: `${service.name} High Breach Rate`,
      description: `${service.breachRate.toFixed(1)}% of patients waiting over 6 weeks`,
      metric: 'Breach Rate',
      value: parseFloat(service.breachRate.toFixed(1)),
      target: 15,
      icon: Activity
    });
  });

  // A&E Critical Issues
  const aePerformance = trustData.ae_4hr_performance_pct;
  if (aePerformance && aePerformance < 70) {
    issues.push({
      category: 'A&E',
      severity: aePerformance < 50 ? 'Critical' : 'High',
      title: 'A&E 4-Hour Performance Critical',
      description: 'Emergency department performance significantly below target',
      metric: 'Performance',
      value: aePerformance,
      target: 95,
      icon: Activity
    });
  }

  // 12-hour wait issues
  const twelveHourWaits = trustData.ae_12hr_wait_admissions;
  if (twelveHourWaits && twelveHourWaits > 50) {
    issues.push({
      category: 'A&E',
      severity: twelveHourWaits > 100 ? 'Critical' : 'High',
      title: '12-Hour Emergency Waits',
      description: 'Excessive 12-hour waits indicate severe capacity issues',
      metric: '12-hour waits',
      value: twelveHourWaits,
      icon: Clock
    });
  }

  // Capacity Critical Issues
  const virtualWardOccupancy = trustData.virtual_ward_occupancy_rate;
  if (virtualWardOccupancy && virtualWardOccupancy > 95) {
    issues.push({
      category: 'Capacity',
      severity: 'High',
      title: 'Virtual Ward Over-Capacity',
      description: 'Virtual ward utilization exceeding safe operational limits',
      metric: 'Occupancy',
      value: virtualWardOccupancy,
      target: 85,
      icon: Building2
    });
  }

  // Sort by severity (Critical first, then High, then Moderate)
  return issues.sort((a, b) => {
    const severityOrder = { Critical: 0, High: 1, Moderate: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}