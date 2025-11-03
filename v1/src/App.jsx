import { Settings, RotateCcw } from 'lucide-react';
import { useContributionCalculator } from './hooks/useContributionCalculator';
import { ContributionTypeToggle } from './components/ContributionTypeToggle';
import { ContributionInput } from './components/ContributionInput';
import { YTDSummary } from './components/YTDSummary';
import { RetirementProjection } from './components/RetirementProjection';
import { EditableValue } from './components/EditableValue';
import mockUserData from './utils/mockData';

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
    handleTypeChange,
    handleAmountChange,
    handleAgeChange,
    handleSalaryChange,
    handleEmployerMatchRateChange,
    handleEmployerMatchCapChange,
    reset,
    getMaxAmount,
  } = calculator;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
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

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            {/* Contribution Controls Card */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contribution Settings
              </h2>

              <div className="space-y-6">
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
                />
              </div>
            </div>

            {/* Annual Summary Card */}
            <div className="card">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Annual Contributions
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your contribution:</span>
                  <span className="font-medium text-gray-900">
                    ${annualContributions.employee.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Employer match:</span>
                  <span className="font-medium text-green-700">
                    ${annualContributions.employer.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-gray-900">Total annual:</span>
                    <span className="text-primary-700">
                      ${annualContributions.total.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: YTD Summary */}
          <div>
            <div className="card h-full">
              <YTDSummary
                ytdContributions={ytdContributions}
                annualContributions={annualContributions}
                employerMatch={employerMatch}
                monthsElapsed={mockUserData.ytd.monthsElapsed}
              />
            </div>
          </div>
        </div>

        {/* Retirement Projection with Graph (Full Width) */}
        <div className="mt-6">
          <div className="card">
            <RetirementProjection
              projection={retirementProjection}
              user={user}
              hasChanges={hasChanges}
              annualContributions={annualContributions}
              originalAnnualContributions={originalAnnualContributions}
              monthsElapsed={mockUserData.ytd.monthsElapsed}
              annualReturnRate={mockUserData.assumptions.averageAnnualReturn}
              ytdData={mockUserData.ytd}
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
