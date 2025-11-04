import { memo } from 'react';
import { PiggyBank, TrendingUp } from 'lucide-react';
import { formatLargeNumber } from '../utils/calculations';

/**
 * ProjectedBalance Component
 *
 * Displays the projected retirement balance with:
 * - Large, prominent total display
 * - Years to retirement
 * - Updated indicator when settings change
 *
 * Performance: Memoized to prevent re-renders when props haven't changed
 */
export const ProjectedBalance = memo(function ProjectedBalance({
  projection,
  user,
  hasChanges,
  contributionImpact,
}) {
  const { futureValue, yearsToRetirement } = projection;

  return (
    <div className="space-y-4">
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
      <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
          <PiggyBank className="text-white" size={32} />
        </div>
        {hasChanges && contributionImpact && contributionImpact.difference !== 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-3xl font-semibold text-gray-500 line-through decoration-2">
                {formatLargeNumber(contributionImpact.current.futureValue)}
              </span>
              <span className="text-2xl text-gray-600">→</span>
              <span className="text-5xl font-bold text-gray-900 number-transition">
                {formatLargeNumber(contributionImpact.new.futureValue)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Total estimated retirement savings
            </div>
            <div className={`text-sm font-medium ${
              contributionImpact.difference > 0 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {contributionImpact.difference > 0 ? '+' : ''}
              {formatLargeNumber(contributionImpact.difference)}
              ({contributionImpact.percentageChange > 0 ? '+' : ''}
              {contributionImpact.percentageChange.toFixed(1)}%)
            </div>
          </div>
        ) : (
          <>
            <div className="text-5xl font-bold text-gray-900 mb-2 number-transition">
              {formatLargeNumber(futureValue)}
            </div>
            <div className="text-sm text-gray-600">
              Total estimated retirement savings
            </div>
          </>
        )}
        {hasChanges && (
          <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <TrendingUp size={14} />
            Updated projection
          </div>
        )}
      </div>
    </div>
  );
});

export default ProjectedBalance;
