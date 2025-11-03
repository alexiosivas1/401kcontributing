import { Settings, RotateCcw } from 'lucide-react';
import { useContributionCalculator } from './hooks/useContributionCalculator';
import { ContributionTypeToggle } from './components/ContributionTypeToggle';
import { ContributionInput } from './components/ContributionInput';
import { YTDSummary } from './components/YTDSummary';
import { RetirementProjection } from './components/RetirementProjection';
import { ImpactVisualization } from './components/ImpactVisualization';
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
    ytdContributions,
    retirementProjection,
    contributionImpact,
    validation,
    user,
    employerMatch,
    handleTypeChange,
    handleAmountChange,
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
              <span className="font-medium text-gray-900">{user.age}</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div>
              <span className="text-gray-600">Annual Salary:</span>{' '}
              <span className="font-medium text-gray-900">
                ${user.salary.toLocaleString()}
              </span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div>
              <span className="text-gray-600">Employer Match:</span>{' '}
              <span className="font-medium text-green-700">
                {employerMatch.percent}% (up to {employerMatch.limit}%)
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Controls */}
          <div className="lg:col-span-1 space-y-6">
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

          {/* Middle Column: YTD Summary */}
          <div className="lg:col-span-1">
            <div className="card h-full">
              <YTDSummary
                ytdContributions={ytdContributions}
                annualContributions={annualContributions}
                employerMatch={employerMatch}
                monthsElapsed={mockUserData.ytd.monthsElapsed}
              />
            </div>
          </div>

          {/* Right Column: Retirement Projection */}
          <div className="lg:col-span-1">
            <div className="card h-full">
              <RetirementProjection
                projection={retirementProjection}
                user={user}
                hasChanges={hasChanges}
              />
            </div>
          </div>
        </div>

        {/* Impact Visualization (Full Width) */}
        {hasChanges && (
          <div className="mt-6">
            <div className="card">
              <ImpactVisualization
                impact={contributionImpact}
                hasChanges={hasChanges}
                annualContributions={annualContributions}
              />
            </div>
          </div>
        )}

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
