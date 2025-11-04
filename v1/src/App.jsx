import { useMemo } from 'react';
import { Settings, RotateCcw } from 'lucide-react';
import { useContributionCalculator } from './hooks/useContributionCalculator';
import { ContributionTypeToggle } from './components/ContributionTypeToggle';
import { ContributionInput } from './components/ContributionInput';
import { YTDSummary } from './components/YTDSummary';
import { ProjectedYearEndContributions } from './components/ProjectedYearEndContributions';
import { RetirementProjection } from './components/RetirementProjection';
import { BalanceBreakdown } from './components/BalanceBreakdown';
import { ProjectedBalance } from './components/ProjectedBalance';
import { EditableValue } from './components/EditableValue';
import mockUserData from './utils/mockData';
import { generateMonthlyProjection } from './utils/graphCalculations';

/**
 * Main App Component
 *
 * 401(k) Contribution Management Application
 *
 * Features:
 * - Contribution type toggle (percentage vs fixed dollar)
 * - Dual input system (slider + text) for contribution amount
 * - Year-to-date contribution summary
 * - Retirement projection calculator
 * - Impact analysis comparing changes
 * - Full mobile responsiveness
 * - Accessibility features (ARIA labels, keyboard navigation)
 */
function App() {
  // Initialize contribution calculator with mock data
  const calculator = useContributionCalculator(mockUserData);

  const {
    contributionType,
    contributionAmount,
    hasChanges,
    annualContributions,
    originalAnnualContributions,
    ytdContributions,
    retirementProjection,
    validation,
    user,
    employerMatch,
    originalValues,
    handleTypeChange,
    handleAmountChange,
    handleAgeChange,
    handleSalaryChange,
    handleEmployerMatchRateChange,
    handleEmployerMatchCapChange,
    reset,
    getMaxAmount,
  } = calculator;

  // Convert original value to current contribution type scale
  const convertedOriginalValue = useMemo(() => {
    if (originalValues.type === contributionType) {
      return originalValues.amount;
    }

    // Convert between percentage and fixed
    if (originalValues.type === 'percentage' && contributionType === 'fixed') {
      // Convert percentage to per-paycheck dollar amount
      return (user.salary * originalValues.amount / 100) / 26;
    } else if (originalValues.type === 'fixed' && contributionType === 'percentage') {
      // Convert per-paycheck dollar amount to percentage
      const annualAmount = originalValues.amount * 26;
      return (annualAmount / user.salary) * 100;
    }

    return originalValues.amount;
  }, [originalValues.type, originalValues.amount, contributionType, user.salary]);

  // Generate monthly projection data for tooltips
  const monthlyData = useMemo(() => {
    return generateMonthlyProjection(
      user.currentBalance,
      annualContributions.employee,
      annualContributions.employer,
      mockUserData.ytd.monthsElapsed,
      mockUserData.assumptions.averageAnnualReturn,
      12,
      mockUserData.ytd
    );
  }, [user.currentBalance, annualContributions]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Settings className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  401(k) Contribution Manager
                </h1>
                <p className="text-sm text-gray-600">
                  Plan your retirement savings
                </p>
              </div>
            </div>
            {hasChanges && (
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                aria-label="Reset to original settings"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Bar */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>{' '}
              <span className="font-medium text-gray-900">{user.name}</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div>
              <span className="text-gray-600">Age:</span>{' '}
              <span className="font-medium text-gray-900">
                <EditableValue
                  value={user.age}
                  onChange={handleAgeChange}
                  formatter={(val) => val}
                  validation={{
                    min: 18,
                    max: 100,
                    type: 'number',
                    formatter: (val) => Math.round(val),
                  }}
                  inputType="number"
                  label="Age"
                />
              </span>
              {user.age >= mockUserData.limits.maxAge && (
                <span className="catchup-badge">
                  ✓ Catch-up
                  <span className="catchup-badge-tooltip">
                    <div className="font-semibold mb-1">Catch-Up Contributions</div>
                    <div className="space-y-1 text-[11px]">
                      <p>At age {mockUserData.limits.maxAge}+, you can contribute an extra <span className="font-semibold text-green-400">${mockUserData.limits.catchUp.toLocaleString()}/year</span> on top of the standard limit.</p>
                      <p>• Standard limit: ${mockUserData.limits.annual.toLocaleString()}</p>
                      <p>• With catch-up: <span className="font-semibold text-green-400">${(mockUserData.limits.annual + mockUserData.limits.catchUp).toLocaleString()}</span> total</p>
                      <p className="text-gray-300 mt-1">This helps you save more as you approach retirement.</p>
                    </div>
                  </span>
                </span>
              )}
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div>
              <span className="text-gray-600">Annual Salary:</span>{' '}
              <span className="font-medium text-gray-900">
                <EditableValue
                  value={user.salary}
                  onChange={handleSalaryChange}
                  formatter={(val) => `$${val.toLocaleString()}`}
                  validation={{
                    min: 1,
                    max: 1000000,
                    type: 'number',
                    formatter: (val) => Math.round(val),
                  }}
                  inputType="number"
                  label="Annual Salary"
                />
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div>
              <span className="text-gray-600">Employer Match:</span>{' '}
              <span className="font-medium text-green-700">
                <EditableValue
                  value={employerMatch.rate}
                  onChange={handleEmployerMatchRateChange}
                  formatter={(val) => `${val * 100}%`}
                  validation={{
                    min: 0,
                    max: 2.0,
                    type: 'decimal',
                    formatter: (val) => parseFloat(val.toFixed(2)),
                  }}
                  inputType="number"
                  label="Employer Match Rate"
                />
                {' '}up to ${(employerMatch.cap / 100 * user.salary).toLocaleString()} (
                <EditableValue
                  value={employerMatch.cap}
                  onChange={handleEmployerMatchCapChange}
                  formatter={(val) => `${val}%`}
                  validation={{
                    min: 0,
                    max: 100,
                    type: 'decimal',
                    formatter: (val) => parseFloat(val.toFixed(1)),
                  }}
                  inputType="number"
                  label="Employer Match Cap"
                />
                {' '}of your annual salary)
              </span>
            </div>
          </div>
        </div>

        {/* Row 1: Three equal-height cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contribution Settings Card */}
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Contribution Settings
            </h2>

            <div className="space-y-4">
              {/* Type Toggle */}
              <ContributionTypeToggle
                value={contributionType}
                onChange={handleTypeChange}
              />

              {/* Amount Input */}
              <ContributionInput
                type={contributionType}
                value={contributionAmount}
                onChange={handleAmountChange}
                maxAmount={getMaxAmount()}
                salary={user.salary}
                validation={validation}
                originalValue={convertedOriginalValue}
                age={user.age}
              />
            </div>
          </div>

          {/* YTD Summary Card */}
          <div className="card">
            <YTDSummary
              ytdContributions={ytdContributions}
              annualContributions={annualContributions}
              employerMatch={employerMatch}
              monthsElapsed={mockUserData.ytd.monthsElapsed}
              monthlyData={monthlyData}
            />
          </div>

          {/* Projected Year-End Contributions Card */}
          <div className="card">
            <ProjectedYearEndContributions
              ytdContributions={ytdContributions}
              annualContributions={annualContributions}
              monthsElapsed={mockUserData.ytd.monthsElapsed}
            />
          </div>
        </div>

        {/* Row 2: Graph (50vh height to fit in viewport) */}
        <div className="mt-6">
          <div className="card h-[50vh]">
            <RetirementProjection
              user={user}
              hasChanges={hasChanges}
              annualContributions={annualContributions}
              originalAnnualContributions={originalAnnualContributions}
              monthsElapsed={mockUserData.ytd.monthsElapsed}
              annualReturnRate={mockUserData.assumptions.averageAnnualReturn}
              ytdData={mockUserData.ytd}
              employerMatch={employerMatch}
              limits={mockUserData.limits}
            />
          </div>
        </div>

        {/* Row 3: Balance Breakdown and Projected Balance */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balance Breakdown */}
          <div className="card">
            <BalanceBreakdown
              projection={retirementProjection}
              user={user}
            />
          </div>

          {/* Projected Retirement Balance */}
          <div className="card">
            <ProjectedBalance
              projection={retirementProjection}
              user={user}
              hasChanges={hasChanges}
              contributionImpact={calculator.contributionImpact}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> This calculator provides estimates based on assumptions
            and should not be considered financial advice. Actual retirement savings may
            vary based on market performance, contribution consistency, and other factors.
            Please consult with a financial advisor for personalized guidance.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            401(k) Contribution Management System • Built with React, Vite, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
