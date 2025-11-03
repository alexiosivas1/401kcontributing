import { memo, useMemo } from 'react';
import { PiggyBank, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency, formatLargeNumber } from '../utils/calculations';
import {
  generateMonthlyProjection,
  generateYearlyProjection,
  calculateProjectionComparison,
  downsampleYearlyData,
} from '../utils/graphCalculations';
import { ContributionGraph } from './ContributionGraph';

/**
 * RetirementProjection Component
 *
 * Displays projected retirement savings with breakdown of:
 * - Current balance
 * - Future contributions
 * - Investment growth
 * - Total projected value
 * - Interactive graph with YTD and full projection views
 *
 * Features:
 * - Large, prominent total display
 * - Interactive contribution graph with toggle
 * - Visual breakdown with icons
 * - Comparison visualization when settings change
 * - Assumptions transparency
 * - Easy-to-understand metrics
 *
 * Performance: Memoized to prevent re-renders when props haven't changed
 */
export const RetirementProjection = memo(function RetirementProjection({
  projection,
  user,
  hasChanges,
  annualContributions,
  originalAnnualContributions,
  monthsElapsed,
  annualReturnRate = 0.07,
  ytdData,
}) {
  const { futureValue, totalContributions, totalGrowth, yearsToRetirement } = projection;

  // Calculate breakdown percentages for visualization
  const currentBalancePercent = (user.currentBalance / futureValue) * 100;
  const contributionsPercent = (totalContributions / futureValue) * 100;
  const growthPercent = (totalGrowth / futureValue) * 100;

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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Projected Retirement Balance
        </h2>
        <p className="text-sm text-gray-600">
          At age {user.retirementAge} ({yearsToRetirement} years from now)
        </p>
      </div>

      {/* Main Projection Display */}
      <div className="text-center p-6 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl border-2 border-primary-200">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-4">
          <PiggyBank className="text-white" size={32} />
        </div>
        <div className="text-5xl font-bold text-gray-900 mb-2 number-transition">
          {formatLargeNumber(futureValue)}
        </div>
        <div className="text-sm text-gray-600">
          Total estimated retirement savings
        </div>
        {hasChanges && (
          <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <TrendingUp size={14} />
            Updated projection
          </div>
        )}
      </div>

      {/* Interactive Graph */}
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

      {/* Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Balance Breakdown</h3>

        {/* Current Balance */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="text-gray-600" size={20} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                Current Balance
              </div>
              <div className="text-xs text-gray-600">Your starting point</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(user.currentBalance, 0)}
            </div>
            <div className="text-xs text-gray-500">
              {currentBalancePercent.toFixed(0)}% of total
            </div>
          </div>
        </div>

        {/* Future Contributions */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                Future Contributions
              </div>
              <div className="text-xs text-gray-600">
                Over {yearsToRetirement} years
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(totalContributions, 0)}
            </div>
            <div className="text-xs text-gray-500">
              {contributionsPercent.toFixed(0)}% of total
            </div>
          </div>
        </div>

        {/* Investment Growth */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <PiggyBank className="text-green-600" size={20} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                Investment Growth
              </div>
              <div className="text-xs text-gray-600">Compound interest</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-green-700">
              +{formatCurrency(totalGrowth, 0)}
            </div>
            <div className="text-xs text-gray-500">
              {growthPercent.toFixed(0)}% of total
            </div>
          </div>
        </div>
      </div>

      {/* Visual stacked bar */}
      <div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
          <div
            className="bg-gray-400 transition-all duration-500"
            style={{ width: `${currentBalancePercent}%` }}
            title={`Current: ${formatCurrency(user.currentBalance, 0)}`}
          />
          <div
            className="bg-blue-500 transition-all duration-500"
            style={{ width: `${contributionsPercent}%` }}
            title={`Contributions: ${formatCurrency(totalContributions, 0)}`}
          />
          <div
            className="bg-green-500 transition-all duration-500"
            style={{ width: `${growthPercent}%` }}
            title={`Growth: ${formatCurrency(totalGrowth, 0)}`}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Current: {currentBalancePercent.toFixed(0)}%</span>
          <span>Contributions: {contributionsPercent.toFixed(0)}%</span>
          <span>Growth: {growthPercent.toFixed(0)}%</span>
        </div>
      </div>

      {/* Assumptions */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-xs font-medium text-gray-700 mb-2">
          Projection Assumptions
        </h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• 7% average annual return (historical market average)</li>
          <li>• Monthly compounding of returns</li>
          <li>• Consistent contribution rate until retirement</li>
          <li>• No withdrawals or loans from the account</li>
          <li>• Values shown in nominal dollars (not adjusted for inflation)</li>
        </ul>
      </div>
    </div>
  );
});

export default RetirementProjection;
