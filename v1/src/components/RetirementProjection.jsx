import { memo, useMemo } from 'react';
import {
  generateMonthlyProjection,
  generateYearlyProjection,
  downsampleYearlyData,
} from '../utils/graphCalculations';
import { ContributionGraph } from './ContributionGraph';

/**
 * RetirementProjection Component
 *
 * Displays interactive contribution graph with:
 * - YTD monthly view
 * - Full projection yearly view
 * - Comparison visualization when settings change
 *
 * Performance: Memoized to prevent re-renders when props haven't changed
 */
export const RetirementProjection = memo(function RetirementProjection({
  user,
  hasChanges,
  annualContributions,
  originalAnnualContributions,
  monthsElapsed,
  annualReturnRate = 0.07,
  ytdData,
}) {
  // Generate monthly projection data for YTD view (memoized for performance)
  const monthlyData = useMemo(() => {
    return generateMonthlyProjection(
      user.currentBalance,
      annualContributions.employee,
      annualContributions.employer,
      monthsElapsed,
      annualReturnRate,
      12, // Project full 12 months
      ytdData // Pass actual YTD data for historical accuracy
    );
  }, [user.currentBalance, annualContributions, monthsElapsed, annualReturnRate, ytdData]);

  // Generate yearly projection data for full retirement view (memoized for performance)
  const yearlyData = useMemo(() => {
    const data = generateYearlyProjection(
      user.currentBalance,
      user.age,
      user.retirementAge,
      annualContributions.employee,
      annualContributions.employer,
      annualReturnRate
    );
    // Downsample if projection is very long (>50 years)
    return downsampleYearlyData(data, 50);
  }, [user, annualContributions, annualReturnRate]);

  // Generate original monthly data for comparison (memoized for performance)
  const originalMonthlyData = useMemo(() => {
    if (!hasChanges || !originalAnnualContributions) return null;

    return generateMonthlyProjection(
      user.currentBalance,
      originalAnnualContributions.employee,
      originalAnnualContributions.employer,
      monthsElapsed,
      annualReturnRate,
      12,
      ytdData // Pass actual YTD data for historical accuracy
    );
  }, [hasChanges, originalAnnualContributions, user.currentBalance, monthsElapsed, annualReturnRate, ytdData]);

  // Generate original yearly data for comparison (memoized for performance)
  const originalYearlyData = useMemo(() => {
    if (!hasChanges || !originalAnnualContributions) return null;

    const data = generateYearlyProjection(
      user.currentBalance,
      user.age,
      user.retirementAge,
      originalAnnualContributions.employee,
      originalAnnualContributions.employer,
      annualReturnRate
    );
    return downsampleYearlyData(data, 50);
  }, [hasChanges, originalAnnualContributions, user, annualReturnRate]);

  return (
    <ContributionGraph
      monthlyData={monthlyData}
      yearlyData={yearlyData}
      originalMonthlyData={originalMonthlyData}
      originalYearlyData={originalYearlyData}
      monthsElapsed={monthsElapsed}
      hasChanges={hasChanges}
      annualContributions={annualContributions}
      annualReturnRate={annualReturnRate}
    />
  );
});

export default RetirementProjection;
