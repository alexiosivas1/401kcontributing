import { memo, useMemo } from 'react';
import {
  generateMonthlyProjection,
  generateYearlyProjection,
  downsampleYearlyData,
  generateMaxCatchupProjection,
} from '../utils/graphCalculations';
import { ContributionGraph } from './ContributionGraph';
import { EditableValue } from './EditableValue';

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
  onAnnualReturnRateChange,
  ytdData,
  employerMatch,
  limits,
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

  // Generate max catch-up projection (memoized for performance)
  // Only show if user will reach catch-up age before retirement
  const catchupYearlyData = useMemo(() => {
    if (!limits || user.retirementAge < limits.maxAge) return null;

    const data = generateMaxCatchupProjection(
      user.currentBalance,
      user.age,
      user.retirementAge,
      limits.annual,
      limits.catchUp,
      limits.maxAge,
      employerMatch.rate,
      employerMatch.cap,
      user.salary,
      annualReturnRate,
      annualContributions.employee,
      annualContributions.employer
    );
    return downsampleYearlyData(data, 50);
  }, [user, limits, employerMatch, annualReturnRate, annualContributions]);

  return (
    <div className="h-full flex flex-col">
      {/* Header with Annual Return Rate control */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-1">
          Assumptions
          <span className="assumptions-label">
            ?
            <span className="assumptions-tooltip">
              <div className="font-semibold mb-1 text-gray-900">Projection Assumptions</div>
              <div className="text-[11px] text-gray-700">
                <p>All retirement projections assume a <span className="font-semibold text-purple-600">7% average annual return</span> on your investments. This is a conservative estimate for long-term retirement accounts invested in diversified portfolios.</p>
              </div>
            </span>
          </span>
        </h2>
        <div className="text-sm text-gray-600">
          <span>Assumed Annual Return: </span>
          <span className="font-medium text-gray-900">
            <EditableValue
              value={annualReturnRate}
              onChange={onAnnualReturnRateChange}
              formatter={(val) => `${(val * 100).toFixed(1)}%`}
              validation={{
                min: 0,
                max: 0.20,
                type: 'decimal',
                formatter: (val) => parseFloat(val.toFixed(4)),
              }}
              inputType="number"
              label="Annual Return Rate"
            />
          </span>
        </div>
      </div>

      {/* Graph */}
      <div className="flex-1 min-h-0">
        <ContributionGraph
          monthlyData={monthlyData}
          yearlyData={yearlyData}
          originalMonthlyData={originalMonthlyData}
          originalYearlyData={originalYearlyData}
          catchupYearlyData={catchupYearlyData}
          monthsElapsed={monthsElapsed}
          hasChanges={hasChanges}
          annualContributions={annualContributions}
          annualReturnRate={annualReturnRate}
          limits={limits}
        />
      </div>
    </div>
  );
});

export default RetirementProjection;
