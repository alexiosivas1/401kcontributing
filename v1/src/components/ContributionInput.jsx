import { useMemo, memo } from 'react';
import { formatCurrency, formatPercentage } from '../utils/calculations';
import { useThrottledCallback } from '../hooks/useThrottledCallback';

/**
 * ContributionInput Component
 *
 * Dual-input system combining slider and text field for optimal UX:
 * - Slider: Quick adjustments with visual feedback
 * - Text field: Precise control for exact amounts
 * - Both stay synchronized in real-time
 *
 * Features:
 * - Range validation
 * - Visual feedback (gradient slider)
 * - Keyboard accessible
 * - Shows current value in both formats
 * - Performance optimized with throttled slider updates (60 FPS)
 * - Memoized computed values to prevent unnecessary recalculations
 */
export const ContributionInput = memo(function ContributionInput({
  type,
  value,
  onChange,
  maxAmount,
  salary,
  validation,
  originalValue,
  age,
}) {
  const isPercentage = type === 'percentage';

  // Determine min, max, and step based on type
  const min = 0;
  const max = maxAmount;
  const step = isPercentage ? 0.5 : 10;

  // Format the current value for display (memoized)
  const displayValue = useMemo(() => {
    return isPercentage
      ? formatPercentage(value)
      : formatCurrency(value, 0);
  }, [isPercentage, value]);

  // Calculate annual amount for context (memoized)
  const annualAmount = useMemo(() => {
    return isPercentage
      ? (salary * value) / 100
      : value * 26;
  }, [isPercentage, salary, value]);

  // Calculate per-paycheck amount (memoized)
  const perPaycheckAmount = useMemo(() => {
    return annualAmount / 26; // Biweekly (26 pay periods per year)
  }, [annualAmount]);

  // Calculate percentage of slider for visual fill (memoized)
  const sliderPercent = useMemo(() => {
    return ((value - min) / (max - min)) * 100;
  }, [value, min, max]);

  // Calculate original value position on slider (memoized)
  const originalPercent = useMemo(() => {
    if (originalValue === undefined) return null;
    return ((originalValue - min) / (max - min)) * 100;
  }, [originalValue, min, max]);

  // Format original value for display (memoized)
  const originalDisplayValue = useMemo(() => {
    if (originalValue === undefined) return null;
    return isPercentage
      ? formatPercentage(originalValue)
      : formatCurrency(originalValue, 0);
  }, [originalValue, isPercentage]);

  // Throttle slider updates to 60 FPS using requestAnimationFrame
  // Without this, slider fires 200-300 updates/second causing jank
  const handleSliderChange = useThrottledCallback((value) => {
    onChange(value);
  });

  const handleTextChange = (e) => {
    const newValue = e.target.value.replace(/[^0-9.]/g, '');
    if (newValue === '') {
      onChange(0);
    } else {
      onChange(Number(newValue));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with value display */}
      <div className="flex items-baseline justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Contribution Amount
        </label>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{displayValue}</div>
          <div className="text-xs text-gray-500 space-y-0.5">
            <div>
              {isPercentage && formatCurrency(perPaycheckAmount, 0)}
              {!isPercentage && displayValue} per paycheck
            </div>
            <div>
              {formatCurrency(annualAmount, 0)} per year
            </div>
          </div>
        </div>
      </div>

      {/* Slider input */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleSliderChange(Number(e.target.value))}
          className="w-full h-3 rounded-lg appearance-none cursor-pointer slider slider-gradient"
          style={{
            '--slider-percent': `${sliderPercent}%`,
          }}
          aria-label={`Contribution amount slider`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={displayValue}
        />

        {/* Original value marker - dashed circle at initial position */}
        {originalPercent !== null && value !== originalValue && (
          <div
            className="absolute top-0 -translate-x-1/2 pointer-events-none"
            style={{ left: `calc(${originalPercent}% + 0.5%)` }}
          >
            {/* Dashed circle marker at original position */}
            <div className="w-5 h-5 rounded-full border-2 border-dashed border-blue-500 bg-white mt-0.5" />
            {/* Label showing original value */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-blue-600 font-medium whitespace-nowrap">
              {originalDisplayValue}
            </div>
          </div>
        )}

        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{isPercentage ? '0%' : '$0'}</span>
          <span className="text-right">
            <div>
              {isPercentage ? `${Math.round(max)}%` : formatCurrency(max, 0)}
            </div>
            {age >= 50 && (
              <div className="text-[10px] text-green-600">$7.5k catch-up available (max: {formatCurrency(validation.applicableLimit, 0)})</div>
            )}
            {age < 50 && (
              <div className="text-[10px] text-gray-400">$7.5k catch-up available at age 50</div>
            )}
          </span>
        </div>
      </div>

      {/* Text input for precise control */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="relative">
            {!isPercentage && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
            )}
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={handleTextChange}
              className={`
                w-full px-4 py-2 border rounded-md
                focus:ring-2 focus:ring-primary-500 focus:border-transparent
                ${!isPercentage ? 'pl-7' : ''}
                ${validation.isValid ? 'border-gray-300' : 'border-red-500'}
              `}
              aria-label="Contribution amount text input"
            />
            {isPercentage && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                %
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Validation messages */}
      {!validation.isValid && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <svg
            className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-red-800">
            <p className="font-medium">Contribution exceeds IRS limit</p>
            <p className="text-red-700 mt-1">
              Maximum allowed: {formatCurrency(validation.applicableLimit, 0)} per
              year. Excess: {formatCurrency(validation.excessAmount, 0)}.
            </p>
          </div>
        </div>
      )}

      {validation.isNearLimit && validation.isValid && (
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <svg
            className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Approaching contribution limit</p>
            <p className="text-yellow-700 mt-1">
              You're within 10% of the annual limit of{' '}
              {formatCurrency(validation.applicableLimit, 0)}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export default ContributionInput;
