import { DollarSign, Percent } from 'lucide-react';

/**
 * ContributionTypeToggle Component
 *
 * Allows users to toggle between fixed dollar amount and percentage-based contributions.
 * Features:
 * - Clear visual distinction between modes
 * - Accessible keyboard navigation
 * - Icons for quick recognition
 */
export function ContributionTypeToggle({ value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Contribution Type
      </label>

      <div
        className="inline-flex rounded-lg bg-gray-100 p-1"
        role="group"
        aria-label="Contribution type selection"
      >
        {/* Percentage Option */}
        <button
          type="button"
          onClick={() => onChange('percentage')}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            ${
              value === 'percentage'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }
          `}
          aria-pressed={value === 'percentage'}
        >
          <Percent size={16} />
          <span>Percentage</span>
        </button>

        {/* Fixed Dollar Option */}
        <button
          type="button"
          onClick={() => onChange('fixed')}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            ${
              value === 'fixed'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }
          `}
          aria-pressed={value === 'fixed'}
        >
          <DollarSign size={16} />
          <span>Per Paycheck</span>
        </button>
      </div>

      <p className="text-xs text-gray-500">
        {value === 'percentage'
          ? 'Set your contribution as a percentage of your salary'
          : 'Set a fixed dollar amount per paycheck (biweekly)'}
      </p>
    </div>
  );
}

export default ContributionTypeToggle;
