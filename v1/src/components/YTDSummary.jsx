import { memo, useState } from 'react';
import { formatCurrency } from '../utils/calculations';
import { MonthsElapsedIndicator } from './MonthsElapsedIndicator';

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
  monthlyData,
}) {
  const progressPercent = (monthsElapsed / 12) * 100;
  const [hasActiveTooltip, setHasActiveTooltip] = useState(false);

  // Calculate monthly averages (actual YTD)
  const monthlyEmployee = ytdContributions.employee / monthsElapsed;
  const monthlyEmployer = ytdContributions.employer / monthsElapsed;

  return (
    <div className={`space-y-6 relative ${hasActiveTooltip ? 'z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Year-to-Date Summary
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 text-right">
          <span>
            Month {monthsElapsed} of 12
          </span>
        </div>
      </div>

      {/* Month squares indicator */}
      <MonthsElapsedIndicator
        monthsElapsed={monthsElapsed}
        monthlyData={monthlyData}
        onTooltipChange={setHasActiveTooltip}
      />

      {/* YTD Totals */}
      <div className="grid grid-cols-3 gap-4">
        {/* Employee Contributions */}
        <div className="text-center p-4 bg-indigo-50 rounded-lg flex flex-col items-center justify-center">
          <div className="text-sm text-indigo-700 font-medium mb-2">
            Your Contributions
          </div>
          <div className="text-2xl font-bold text-indigo-900">
            {formatCurrency(ytdContributions.employee, 0)}
          </div>
          <div className="text-xs text-indigo-600 mt-1">
            {formatCurrency(monthlyEmployee, 0)}/mo avg
          </div>
        </div>

        {/* Employer Match */}
        <div className="text-center p-4 bg-emerald-50 rounded-lg flex flex-col items-center justify-center">
          <div className="text-sm text-emerald-700 font-medium mb-2">
            Employer Match
          </div>
          <div className="text-2xl font-bold text-emerald-900">
            {formatCurrency(ytdContributions.employer, 0)}
          </div>
          <div className="text-xs text-emerald-600 mt-1">
            {formatCurrency(monthlyEmployer, 0)}/mo avg
          </div>
        </div>

        {/* Total */}
        <div className="text-center p-4 bg-gray-100 rounded-lg flex flex-col items-center justify-center">
          <div className="text-sm text-gray-700 font-medium mb-2">
            Total<br />YTD
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(ytdContributions.total, 0)}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {formatCurrency(ytdContributions.total / monthsElapsed, 0)}/mo avg
          </div>
        </div>
      </div>
    </div>
  );
});

export default YTDSummary;
