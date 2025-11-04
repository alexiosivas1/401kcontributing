import { memo, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

/**
 * ProjectedYearEndContributions Component
 *
 * Displays projected year-end contribution totals:
 * - Total projected contributions (employee + employer)
 * - Employee contribution breakdown
 * - Employer match breakdown
 *
 * Calculation: Actual YTD + (new monthly rate × remaining months)
 *
 * Performance: Memoized to prevent re-renders when props haven't changed
 */
export const ProjectedYearEndContributions = memo(function ProjectedYearEndContributions({
  ytdContributions,
  annualContributions,
  monthsElapsed,
}) {
  const monthsRemaining = 12 - monthsElapsed;

  // Calculate projected year-end totals (memoized for performance)
  const projected = useMemo(() => {
    const newMonthlyEmployee = annualContributions.employee / 12;
    const newMonthlyEmployer = annualContributions.employer / 12;

    return {
      employee: ytdContributions.employee + (newMonthlyEmployee * monthsRemaining),
      employer: ytdContributions.employer + (newMonthlyEmployer * monthsRemaining),
      total: ytdContributions.total + ((newMonthlyEmployee + newMonthlyEmployer) * monthsRemaining),
    };
  }, [ytdContributions, annualContributions, monthsRemaining]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="text-blue-600" size={20} />
        <h3 className="text-base font-semibold text-gray-900">
          Projected Year-End
        </h3>
      </div>

      {/* Total */}
      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
        <div className="text-3xl font-bold text-gray-900">
          {formatCurrency(projected.total, 0)}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          Total contributions
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Employee:</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(projected.employee, 0)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Employer:</span>
          <span className="font-medium text-emerald-700">
            {formatCurrency(projected.employer, 0)}
          </span>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-xs text-gray-500 text-center">
        Based on current rate for remaining {monthsRemaining} month{monthsRemaining !== 1 ? 's' : ''}
      </p>
    </div>
  );
});

export default ProjectedYearEndContributions;
