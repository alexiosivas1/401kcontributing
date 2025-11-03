import { memo } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

/**
 * YTDSummary Component
 *
 * Displays year-to-date contribution summary with visual progress indicators.
 * Shows both employee and employer contributions with clear breakdown.
 *
 * Features:
 * - Visual progress bars
 * - Color-coded contributions (employee vs employer)
 * - Monthly average display
 * - Projected year-end total
 *
 * Performance: Memoized to prevent re-renders when props haven't changed
 */
export const YTDSummary = memo(function YTDSummary({
  ytdContributions,
  annualContributions,
  employerMatch,
  monthsElapsed,
}) {
  const monthsRemaining = 12 - monthsElapsed;
  const progressPercent = (monthsElapsed / 12) * 100;

  // Calculate monthly averages
  const monthlyEmployee = ytdContributions.employee / monthsElapsed;
  const monthlyEmployer = ytdContributions.employer / monthsElapsed;

  // Projected year-end totals
  const projectedEmployee = annualContributions.employee;
  const projectedEmployer = annualContributions.employer;
  const projectedTotal = projectedEmployee + projectedEmployer;

  // Calculate progress percentages for visual bars
  const employeeProgressPercent = Math.min(
    100,
    (ytdContributions.employee / projectedEmployee) * 100
  );
  const employerProgressPercent = Math.min(
    100,
    (ytdContributions.employer / projectedEmployer) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Year-to-Date Summary
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>
            {monthsElapsed} of 12 months ({Math.round(progressPercent)}%)
          </span>
        </div>
      </div>

      {/* Overall progress bar */}
      <div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Year progress"
          />
        </div>
      </div>

      {/* YTD Totals */}
      <div className="grid grid-cols-3 gap-4">
        {/* Employee Contributions */}
        <div className="text-center p-4 bg-primary-50 rounded-lg">
          <div className="text-sm text-primary-700 font-medium mb-1">
            Your Contributions
          </div>
          <div className="text-2xl font-bold text-primary-900">
            {formatCurrency(ytdContributions.employee, 0)}
          </div>
          <div className="text-xs text-primary-600 mt-1">
            {formatCurrency(monthlyEmployee, 0)}/mo avg
          </div>
        </div>

        {/* Employer Match */}
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-sm text-green-700 font-medium mb-1">
            Employer Match
          </div>
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(ytdContributions.employer, 0)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {formatCurrency(monthlyEmployer, 0)}/mo avg
          </div>
        </div>

        {/* Total */}
        <div className="text-center p-4 bg-gray-100 rounded-lg">
          <div className="text-sm text-gray-700 font-medium mb-1">
            Total YTD
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(ytdContributions.total, 0)}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {formatCurrency(ytdContributions.total / monthsElapsed, 0)}/mo avg
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-3">
        {/* Employee Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">Your annual contributions</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(ytdContributions.employee, 0)} of{' '}
              {formatCurrency(projectedEmployee, 0)}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-500"
              style={{ width: `${employeeProgressPercent}%` }}
              role="progressbar"
              aria-valuenow={employeeProgressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Employee contribution progress"
            />
          </div>
        </div>

        {/* Employer Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">
              Employer match ({employerMatch.rate * 100}%)
            </span>
            <span className="font-medium text-gray-900">
              {formatCurrency(ytdContributions.employer, 0)} of{' '}
              {formatCurrency(projectedEmployer, 0)}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${employerProgressPercent}%` }}
              role="progressbar"
              aria-valuenow={employerProgressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Employer match progress"
            />
          </div>
        </div>
      </div>

      {/* Projection */}
      {monthsRemaining > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingUp className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">
                Projected Year-End Total
              </h3>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {formatCurrency(projectedTotal, 0)}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Based on your current contribution rate for the remaining{' '}
                {monthsRemaining} month{monthsRemaining !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default YTDSummary;
