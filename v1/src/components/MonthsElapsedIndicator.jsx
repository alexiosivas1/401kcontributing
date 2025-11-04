import { memo, useState } from 'react';
import { formatCurrency } from '../utils/calculations';

/**
 * MonthsElapsedIndicator Component
 *
 * Displays 12 squares representing months Jan-Dec with visual states:
 * - Past months: Filled slate
 * - Current month: Filled purple (with pulse animation)
 * - Future months: Empty outline
 *
 * Optimized with React.memo following OPTIMIZATION_LOG.md patterns
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const MonthsElapsedIndicator = memo(function MonthsElapsedIndicator({
  monthsElapsed = 0,
  monthlyData = [],
  onTooltipChange,
}) {
  const [hoveredMonth, setHoveredMonth] = useState(null);

  const handleMouseEnter = (monthNumber) => {
    setHoveredMonth(monthNumber);
    if (onTooltipChange) onTooltipChange(true);
  };

  const handleMouseLeave = () => {
    setHoveredMonth(null);
    if (onTooltipChange) onTooltipChange(false);
  };

  return (
    <div
      className="grid grid-cols-6 gap-2 justify-items-center"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="12"
      aria-valuenow={monthsElapsed}
      aria-label={`${monthsElapsed} of 12 months completed`}
    >
      {MONTHS.map((month, index) => {
        const monthNumber = index + 1;
        const isPast = monthNumber < monthsElapsed;
        const isCurrent = monthNumber === monthsElapsed;
        const isFuture = monthNumber > monthsElapsed;

        // Determine styles based on state
        let containerClasses = 'relative flex flex-col items-center';
        let squareClasses = 'w-8 h-8 rounded-md border-2 flex items-center justify-center transition-all duration-300';
        let labelClasses = 'text-xs mt-1';

        if (isPast) {
          // Past months: filled slate
          squareClasses += ' bg-slate-400 border-slate-400 opacity-80';
          labelClasses += ' text-gray-600';
        } else if (isCurrent) {
          // Current month: filled purple with pulse
          squareClasses += ' bg-purple-500 border-purple-600 animate-pulse';
          labelClasses += ' text-purple-700 font-semibold';
        } else {
          // Future months: empty outline
          squareClasses += ' bg-transparent border-slate-300 border-dashed';
          labelClasses += ' text-gray-400';
        }

        // Calculate monthly values from cumulative data
        const currentData = monthlyData[monthNumber];
        const previousData = monthlyData[monthNumber - 1] || { employee: 0, employer: 0, growth: 0 };
        const monthlyContribution = currentData ? currentData.employee - previousData.employee : 0;
        const monthlyEmployer = currentData ? currentData.employer - previousData.employer : 0;
        const monthlyGrowth = currentData ? currentData.growth - previousData.growth : 0;

        return (
          <div
            key={month}
            className={containerClasses}
            aria-hidden="true"
            onMouseEnter={() => handleMouseEnter(monthNumber)}
            onMouseLeave={handleMouseLeave}
          >
            <div className={squareClasses}>
              <span className="text-xs font-medium text-white">
                {isCurrent ? '•' : ''}
              </span>
            </div>
            <span className={labelClasses}>{month}</span>

            {/* Tooltip */}
            {hoveredMonth === monthNumber && currentData && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-[9999] bg-white p-3 border border-gray-300 rounded-lg shadow-lg min-w-[200px]">
                <p className="text-xs font-semibold text-gray-900 mb-2">{month}</p>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Contribution</span>
                    <span className="font-medium text-indigo-600">{formatCurrency(monthlyContribution, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Employer Match</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(monthlyEmployer, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Growth</span>
                    <span className="font-medium text-violet-600">{formatCurrency(monthlyGrowth, 0)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default MonthsElapsedIndicator;
