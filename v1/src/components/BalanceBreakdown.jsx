import { memo } from 'react';
import { PiggyBank, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

/**
 * BalanceBreakdown Component
 *
 * Displays breakdown of projected retirement balance:
 * - Current balance
 * - Future contributions
 * - Investment growth
 * - Visual stacked bar chart
 *
 * Performance: Memoized to prevent re-renders when props haven't changed
 */
export const BalanceBreakdown = memo(function BalanceBreakdown({
  projection,
  user,
}) {
  const { futureValue, totalContributions, totalGrowth, yearsToRetirement } = projection;

  // Calculate breakdown percentages for visualization
  const currentBalancePercent = (user.currentBalance / futureValue) * 100;
  const contributionsPercent = (totalContributions / futureValue) * 100;
  const growthPercent = (totalGrowth / futureValue) * 100;

  return (
    <div className="space-y-4">
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
      <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <PiggyBank className="text-violet-600" size={20} />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              Investment Growth
            </div>
            <div className="text-xs text-gray-600">Compound interest</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-violet-700">
            +{formatCurrency(totalGrowth, 0)}
          </div>
          <div className="text-xs text-gray-500">
            {growthPercent.toFixed(0)}% of total
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
            className="bg-violet-500 transition-all duration-500"
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
    </div>
  );
});

export default BalanceBreakdown;
