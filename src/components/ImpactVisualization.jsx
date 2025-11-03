import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatLargeNumber } from '../utils/calculations';

/**
 * ImpactVisualization Component
 *
 * Shows the impact of changing contribution amounts by comparing:
 * - Original projection vs new projection
 * - Dollar difference
 * - Percentage change
 *
 * Features:
 * - Side-by-side comparison
 * - Visual indicators (up/down arrows)
 * - Color coding (green for increase, red for decrease)
 * - Conditional rendering (only shows when changes are made)
 */
export function ImpactVisualization({ impact, hasChanges, annualContributions }) {
  if (!hasChanges) {
    return null; // Don't show if no changes made
  }

  const { current, new: newProjection, difference, percentageChange } = impact;
  const isIncrease = difference > 0;

  // Calculate annual contribution difference
  const annualDifference = newProjection.totalContributions - current.totalContributions;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Impact Analysis</h2>
        {isIncrease ? (
          <div className="flex items-center gap-1 text-green-700">
            <TrendingUp size={18} />
            <span className="text-sm font-medium">Increase</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-orange-700">
            <TrendingDown size={18} />
            <span className="text-sm font-medium">Decrease</span>
          </div>
        )}
      </div>

      {/* Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Original Projection */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Original Projection</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatLargeNumber(current.futureValue)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            At retirement (age {current.yearsToRetirement + 30})
          </div>
        </div>

        {/* Arrow */}
        <div className="flex justify-center">
          <div
            className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-full
            ${isIncrease ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}
          `}
          >
            <ArrowRight size={20} />
          </div>
        </div>

        {/* New Projection */}
        <div
          className={`
          p-4 rounded-lg border-2
          ${isIncrease ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}
        `}
        >
          <div
            className={`text-xs mb-1 ${isIncrease ? 'text-green-700' : 'text-orange-700'}`}
          >
            New Projection
          </div>
          <div
            className={`text-2xl font-bold ${isIncrease ? 'text-green-900' : 'text-orange-900'}`}
          >
            {formatLargeNumber(newProjection.futureValue)}
          </div>
          <div
            className={`text-xs mt-1 ${isIncrease ? 'text-green-600' : 'text-orange-600'}`}
          >
            At retirement (age {newProjection.yearsToRetirement + 30})
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div
        className={`
        p-4 rounded-lg border-2
        ${isIncrease ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}
      `}
      >
        <div className="flex items-start gap-3">
          {isIncrease ? (
            <TrendingUp className="text-green-600 flex-shrink-0 mt-1" size={24} />
          ) : (
            <TrendingDown className="text-orange-600 flex-shrink-0 mt-1" size={24} />
          )}
          <div className="flex-1">
            <h3
              className={`text-sm font-medium mb-1 ${isIncrease ? 'text-green-900' : 'text-orange-900'}`}
            >
              {isIncrease ? 'Increased' : 'Decreased'} Retirement Savings
            </h3>
            <div
              className={`text-3xl font-bold mb-2 ${isIncrease ? 'text-green-900' : 'text-orange-900'}`}
            >
              {isIncrease ? '+' : ''}
              {formatCurrency(difference, 0)}
            </div>
            <div
              className={`text-sm ${isIncrease ? 'text-green-700' : 'text-orange-700'}`}
            >
              <span className="font-medium">
                {isIncrease ? '+' : ''}
                {percentageChange.toFixed(1)}%
              </span>{' '}
              change from your original contribution rate
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* Annual Contribution Change */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Annual Contribution Change</div>
          <div className="text-lg font-semibold text-gray-900">
            {isIncrease ? '+' : ''}
            {formatCurrency(annualDifference, 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {formatCurrency(annualContributions.total, 0)}/year total
          </div>
        </div>

        {/* Additional Growth */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">
            {isIncrease ? 'Additional' : 'Reduced'} Growth
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {isIncrease ? '+' : ''}
            {formatCurrency(
              newProjection.totalGrowth - current.totalGrowth,
              0
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">From compound interest</div>
        </div>
      </div>

      {/* Insight */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          💡 What This Means
        </h4>
        <p className="text-sm text-blue-800">
          {isIncrease ? (
            <>
              By increasing your contribution, you'll have{' '}
              <strong>{formatCurrency(difference, 0)} more</strong> in retirement.
              That's the power of compound interest over{' '}
              {newProjection.yearsToRetirement} years!
            </>
          ) : (
            <>
              Reducing your contribution means{' '}
              <strong>{formatCurrency(Math.abs(difference), 0)} less</strong> in
              retirement. Consider if this aligns with your long-term goals.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default ImpactVisualization;
