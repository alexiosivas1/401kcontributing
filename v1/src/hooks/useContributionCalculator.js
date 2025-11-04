import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  calculateTotalAnnualContribution,
  calculateYTDContributions,
  calculateRetirementProjection,
  calculateContributionImpact,
  validateContribution,
  percentageToFixed,
  fixedToPercentage,
} from '../utils/calculations';

/**
 * Custom hook for managing 401(k) contribution calculations
 *
 * This hook centralizes all state management and calculations,
 * making it easy to use across components without prop drilling.
 *
 * Optimized following OPTIMIZATION_LOG.md patterns:
 * - useMemo for all calculations
 * - useCallback for all handlers
 */
export function useContributionCalculator(initialData) {
  // Extract initial values from mock data
  const {
    user: initialUser,
    contribution: initialContribution,
    ytd,
    limits,
    assumptions,
  } = initialData;

  // State for contribution settings
  const [contributionType, setContributionType] = useState(initialContribution.type);
  const [contributionAmount, setContributionAmount] = useState(initialContribution.amount);

  // State for user editable fields
  const [age, setAge] = useState(initialUser.age);
  const [salary, setSalary] = useState(initialUser.salary);
  const [employerMatchRate, setEmployerMatchRate] = useState(initialContribution.employerMatchRate);
  const [employerMatchCap, setEmployerMatchCap] = useState(initialContribution.employerMatchCap);
  const [annualReturnRate, setAnnualReturnRate] = useState(assumptions.averageAnnualReturn);

  // Store original contribution values for comparison (fixed)
  const [originalContributionValues] = useState({
    type: initialContribution.type,
    amount: initialContribution.amount,
  });

  // Store baseline values (salary, match) - updates dynamically, no comparison
  const [baselineValues, setBaselineValues] = useState({
    salary: initialUser.salary,
    employerMatchRate: initialContribution.employerMatchRate,
    employerMatchCap: initialContribution.employerMatchCap,
  });

  // Update baseline values when salary or employer match changes
  useEffect(() => {
    setBaselineValues({
      salary,
      employerMatchRate,
      employerMatchCap,
    });
  }, [salary, employerMatchRate, employerMatchCap]);

  // Create user object with current values (memoized)
  const user = useMemo(() => ({
    ...initialUser,
    age,
    salary,
  }), [initialUser, age, salary]);

  /**
   * Calculate current annual contributions (employee + employer)
   * Memoized to avoid recalculation on every render
   */
  const annualContributions = useMemo(() => {
    return calculateTotalAnnualContribution(
      contributionType,
      contributionAmount,
      salary,
      employerMatchRate,
      employerMatchCap
    );
  }, [contributionType, contributionAmount, salary, employerMatchRate, employerMatchCap]);

  /**
   * Calculate original annual contributions for comparison
   * Uses ORIGINAL contribution values with CURRENT baseline (salary, match)
   */
  const originalAnnualContributions = useMemo(() => {
    return calculateTotalAnnualContribution(
      originalContributionValues.type,
      originalContributionValues.amount,
      baselineValues.salary,
      baselineValues.employerMatchRate,
      baselineValues.employerMatchCap
    );
  }, [originalContributionValues, baselineValues]);

  /**
   * Year-to-date contributions (actual historical data - doesn't change with slider)
   */
  const ytdContributions = useMemo(() => {
    return {
      employee: ytd.employeeContributed,
      employer: ytd.employerMatched,
      total: ytd.totalContributed,
    };
  }, [ytd]);

  /**
   * Validate current contribution against IRS limits
   */
  const validation = useMemo(() => {
    return validateContribution(annualContributions.employee, user.age, limits);
  }, [annualContributions.employee, user.age, limits]);

  /**
   * Calculate retirement projection with current settings
   */
  const retirementProjection = useMemo(() => {
    return calculateRetirementProjection(
      user.currentBalance,
      annualContributions.total,
      user.age,
      user.retirementAge,
      annualReturnRate
    );
  }, [user, annualContributions.total, annualReturnRate]);

  /**
   * Calculate impact of contribution changes
   */
  const contributionImpact = useMemo(() => {
    return calculateContributionImpact(
      user.currentBalance,
      originalAnnualContributions.total,
      annualContributions.total,
      user.age,
      user.retirementAge,
      annualReturnRate
    );
  }, [user, originalAnnualContributions.total, annualContributions.total, annualReturnRate]);

  /**
   * Check if CONTRIBUTION settings have changed from original
   * Only tracks contribution type/amount, NOT baseline values (salary, match)
   * Optimized with useMemo
   */
  const hasChanges = useMemo(() => {
    return (
      contributionType !== originalContributionValues.type ||
      contributionAmount !== originalContributionValues.amount
    );
  }, [contributionType, contributionAmount, originalContributionValues]);

  /**
   * Update contribution type and convert amount if needed
   * Optimized with useCallback
   */
  const handleTypeChange = useCallback((newType) => {
    if (newType === contributionType) return;

    let newAmount = contributionAmount;

    // Convert between percentage and fixed
    if (newType === 'fixed') {
      // Converting from percentage to fixed (per paycheck)
      const annualAmount = percentageToFixed(contributionAmount, salary);
      newAmount = annualAmount / 26; // Biweekly
    } else {
      // Converting from fixed to percentage
      const annualAmount = contributionAmount * 26;
      newAmount = fixedToPercentage(annualAmount, salary);
    }

    setContributionType(newType);
    setContributionAmount(Number(newAmount.toFixed(2)));
  }, [contributionType, contributionAmount, salary]);

  /**
   * Update contribution amount with validation
   * Optimized with useCallback
   */
  const handleAmountChange = useCallback((newAmount) => {
    // Ensure non-negative
    const validAmount = Math.max(0, Number(newAmount));
    setContributionAmount(validAmount);
  }, []);

  /**
   * Update age with validation
   * Optimized with useCallback
   */
  const handleAgeChange = useCallback((newAge) => {
    setAge(newAge);
  }, []);

  /**
   * Update salary with validation
   * Optimized with useCallback
   */
  const handleSalaryChange = useCallback((newSalary) => {
    setSalary(newSalary);
  }, []);

  /**
   * Update employer match rate with validation
   * Optimized with useCallback
   */
  const handleEmployerMatchRateChange = useCallback((newRate) => {
    setEmployerMatchRate(newRate);
  }, []);

  /**
   * Update employer match cap with validation
   * Optimized with useCallback
   */
  const handleEmployerMatchCapChange = useCallback((newCap) => {
    setEmployerMatchCap(newCap);
  }, []);

  /**
   * Update annual return rate with validation
   * Optimized with useCallback
   */
  const handleAnnualReturnRateChange = useCallback((newRate) => {
    setAnnualReturnRate(newRate);
  }, []);

  /**
   * Reset ONLY contribution settings to original values
   * Does NOT reset baseline values (salary, match) - those stay at current values
   */
  const reset = useCallback(() => {
    setContributionType(originalContributionValues.type);
    setContributionAmount(originalContributionValues.amount);
  }, [originalContributionValues]);

  /**
   * Get max contribution amount based on type
   */
  const getMaxAmount = () => {
    if (contributionType === 'percentage') {
      return Math.min(100, (validation.applicableLimit / user.salary) * 100);
    } else {
      // For fixed, max per paycheck to hit annual limit
      return validation.applicableLimit / 26;
    }
  };

  return {
    // State
    contributionType,
    contributionAmount,
    hasChanges,
    annualReturnRate,

    // Calculations
    annualContributions,
    originalAnnualContributions,
    ytdContributions,
    retirementProjection,
    contributionImpact,
    validation,

    // User data
    user,
    limits,
    employerMatch: {
      rate: employerMatchRate,
      cap: employerMatchCap,
    },
    originalContributionValues,
    baselineValues,

    // Actions
    handleTypeChange,
    handleAmountChange,
    handleAgeChange,
    handleSalaryChange,
    handleEmployerMatchRateChange,
    handleEmployerMatchCapChange,
    handleAnnualReturnRateChange,
    reset,
    getMaxAmount,
  };
}

export default useContributionCalculator;
