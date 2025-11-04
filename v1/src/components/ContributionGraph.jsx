import { memo, useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from 'recharts';
import { formatCurrency } from '../utils/calculations';

/**
 * ContributionGraph Component
 *
 * Interactive graph showing contribution projections with two views:
 * - YTD View: Monthly breakdown for current year
 * - Projection View: Yearly projection to retirement
 *
 * Features:
 * - Three lines: Employee, Employer, Total Balance
 * - "Today" marker line (YTD view only)
 * - Comparison line (dashed, color-coded) when settings change
 * - Enhanced tooltip with growth breakdown
 * - Toggle between views
 * - Fully responsive
 * - Performance optimized with memo and disabled animations
 */
export const ContributionGraph = memo(function ContributionGraph({
  monthlyData,
  yearlyData,
  originalMonthlyData,
  originalYearlyData,
  catchupYearlyData,
  monthsElapsed,
  hasChanges,
  annualContributions, // For calculating per-period amounts
  annualReturnRate = 0.07, // Assumed market return rate
  limits, // IRS contribution limits for dynamic tooltip values
}) {
  const [viewMode, setViewMode] = useState('yearly'); // 'monthly' or 'yearly'

  // Select data based on view mode and merge comparison data if available
  const chartData = useMemo(() => {
    const baseData = viewMode === 'monthly' ? monthlyData : yearlyData;
    const originalData = viewMode === 'monthly' ? originalMonthlyData : originalYearlyData;

    // Merge all additional data (original balance for comparison, catch-up projection)
    return baseData.map((point, index) => ({
      ...point,
      // Add originalBalance for comparison if changes exist
      originalBalance: hasChanges && originalData ? originalData[index]?.balance || null : null,
      // Add catchupBalance for catch-up projection (only in yearly view)
      catchupBalance: viewMode === 'yearly' && catchupYearlyData ? catchupYearlyData[index]?.catchupBalance || null : null,
    }));
  }, [viewMode, monthlyData, yearlyData, originalMonthlyData, originalYearlyData, catchupYearlyData, hasChanges]);

  // Determine x-axis configuration based on view mode
  const xAxisConfig = useMemo(() => {
    if (viewMode === 'monthly') {
      return {
        dataKey: 'month',
        label: { value: 'Month', position: 'insideBottom', offset: -5 },
        tickFormatter: (value) => `M${value}`,
      };
    }
    return {
      dataKey: 'year',
      label: { value: 'Years from Now', position: 'insideBottom', offset: -5 },
      tickFormatter: (value) => value === 0 ? 'Now' : `+${value}`,
    };
  }, [viewMode]);

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    // Calculate percentages for balance breakdown
    const contributionsPercent = data.balance > 0 ? (data.total / data.balance * 100) : 0;
    const growthPercent = data.balance > 0 ? (data.growth / data.balance * 100) : 0;
    const startingPercent = data.balance > 0 ? (data.startingBalance / data.balance * 100) : 0;

    // Calculate per-period contributions
    const periodEmployee = viewMode === 'monthly'
      ? annualContributions.employee / 12
      : annualContributions.employee;
    const periodEmployer = viewMode === 'monthly'
      ? annualContributions.employer / 12
      : annualContributions.employer;

    // Calculate comparison percentage
    const comparisonPercent = data.originalBalance && data.originalBalance > 0
      ? ((data.balance - data.originalBalance) / data.originalBalance * 100)
      : 0;

    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg max-w-lg">
        {/* Header */}
        <p className="text-sm font-semibold text-gray-900 mb-3">
          {viewMode === 'monthly' ? `Month ${data.month}` : `Year ${data.year} (Age ${data.age})`}
        </p>

        {/* PRIMARY: Total Balance with Breakdown */}
        <div className="mb-3">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-xs font-medium text-gray-600">Total Balance</span>
            <span className="text-lg font-bold text-blue-700">{formatCurrency(data.balance, 0)}</span>
          </div>
          <div className="space-y-0.5 text-[11px] text-gray-600 ml-2">
            <div className="flex justify-between">
              <span>• Contributions ({contributionsPercent.toFixed(0)}%)</span>
              <span className="font-medium">{formatCurrency(data.total, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>• Growth ({growthPercent.toFixed(0)}%)</span>
              <span className="font-medium text-violet-600">{formatCurrency(data.growth, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>• Starting ({startingPercent.toFixed(0)}%)</span>
              <span className="font-medium">{formatCurrency(data.startingBalance, 0)}</span>
            </div>
          </div>
        </div>

        {/* ASSUMED RETURN RATE */}
        {data.isProjected && (
          <div className="pt-2 border-t border-gray-200 mb-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Assumed Return</span>
              <span className="font-semibold text-purple-600">{(annualReturnRate * 100).toFixed(0)}% annually</span>
            </div>
          </div>
        )}

        {/* COMPARISON */}
        {data.originalBalance && hasChanges && data.isProjected && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-600 mb-0.5">
              <span>Original projection</span>
              <span>{formatCurrency(data.originalBalance, 0)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-900 font-semibold mb-0.5">
              <span>New projection</span>
              <span>{formatCurrency(data.balance, 0)}</span>
            </div>
            <div className={`flex justify-between text-xs font-bold ${
              data.balance > data.originalBalance ? 'text-green-600' : 'text-orange-600'
            }`}>
              <span>Difference</span>
              <span>
                {data.balance > data.originalBalance ? '+' : ''}
                {formatCurrency(data.balance - data.originalBalance, 0)}
              </span>
            </div>
          </div>
        )}

        {/* CATCH-UP SCENARIO */}
        {data.catchupBalance && (
          <div className="pt-2 mt-2 border-t border-purple-200">
            <div className="text-xs font-semibold text-purple-700 mb-1">
              💰 Max Catch-up Scenario
            </div>
            <div className="text-[10px] text-gray-600 mb-2">
              Maxing out contributions (${limits ? ((limits.annual + limits.catchUp) / 1000).toFixed(1) : '30.5'}k/year) from age {limits?.maxAge || 50}
            </div>
            <div className="flex justify-between text-xs mb-0.5">
              <span className="text-purple-600">Projected balance:</span>
              <span className="font-semibold">{formatCurrency(data.catchupBalance, 0)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-green-600">
              <span>Extra savings:</span>
              <span>+{formatCurrency(data.catchupBalance - data.balance, 0)}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Determine "today" marker position
  const todayPosition = useMemo(() => {
    if (viewMode === 'monthly') {
      return monthsElapsed;
    }
    return 0; // For yearly view, "today" is at year 0
  }, [viewMode, monthsElapsed]);

  // Calculate if the change is an increase or decrease
  const isIncrease = useMemo(() => {
    if (!hasChanges || !chartData || chartData.length === 0) return true;
    const lastPoint = chartData[chartData.length - 1];
    return lastPoint.balance >= (lastPoint.originalBalance || 0);
  }, [hasChanges, chartData]);

  return (
    <div className="space-y-4">
      {/* Toggle Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Contribution Projection
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'monthly'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label="Show monthly YTD view"
          >
            YTD View
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === 'yearly'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label="Show yearly projection view"
          >
            Projection View
          </button>
        </div>
      </div>

      {/* Graph */}
      <div className="w-full bg-white rounded-lg border border-gray-200 p-4">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              {...xAxisConfig}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => {
                if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                return `$${value}`;
              }}
              label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ zIndex: 1000 }}
              cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              iconType="line"
            />

            {/* Today marker */}
            {viewMode === 'monthly' && (
              <ReferenceLine
                x={todayPosition}
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: 'Today',
                  position: 'top',
                  fill: '#8b5cf6',
                  fontSize: 12,
                  fontWeight: 'bold',
                }}
              />
            )}

            {/* Original balance line for comparison (if changes exist) */}
            {hasChanges && chartData[0]?.originalBalance && (
              <Line
                type="monotone"
                dataKey="originalBalance"
                stroke={isIncrease ? 'rgba(34, 197, 94, 0.8)' : 'rgba(249, 115, 22, 0.8)'}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Original Balance"
                animationDuration={0}
              />
            )}

            {/* Total Balance line */}
            <Line
              type="monotone"
              dataKey="balance"
              stroke="rgba(37, 99, 235, 0.9)"
              strokeWidth={3}
              dot={false}
              name="Total Balance"
              animationDuration={0}
            />

            {/* Max Catch-up Scenario line (purple dashed) */}
            {chartData[0]?.catchupBalance && (
              <Line
                type="monotone"
                dataKey="catchupBalance"
                stroke="#8b5cf6"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={false}
                name="Max Catch-up"
                opacity={0.7}
                animationDuration={0}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* View description */}
      <p className="text-xs text-gray-600 text-center">
        {viewMode === 'monthly' ? (
          <>
            Showing monthly contributions for the current year.
            <span className="text-purple-600 font-medium"> Purple line</span> marks today.
          </>
        ) : (
          <>
            Showing projected balance growth to retirement at age{' '}
            {yearlyData[yearlyData.length - 1]?.age || 65}.
          </>
        )}
        {hasChanges && chartData[0]?.originalBalance && (
          <span className={isIncrease ? 'text-green-600' : 'text-orange-600'}>
            {' '}
            {isIncrease ? 'Green' : 'Orange'} dashed line shows your original projection for comparison.
          </span>
        )}
      </p>
    </div>
  );
});

export default ContributionGraph;
