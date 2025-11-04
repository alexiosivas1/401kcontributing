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

  // Store original values for reset and comparison
  const [originalValues] = useState({
    type: initialContribution.type,
    amount: initialContribution.amount,
    age: initialUser.age,
    salary: initialUser.salary,
    employerMatchRate: initialContribution.employerMatchRate,
    employerMatchCap: initialContribution.employerMatchCap,
  });

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
   */
  const originalAnnualContributions = useMemo(() => {
    return calculateTotalAnnualContribution(
      originalValues.type,
      originalValues.amount,
      originalValues.salary,
      originalValues.employerMatchRate,
      originalValues.employerMatchCap
    );
  }, [originalValues]);

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
      assumptions.averageAnnualReturn
    );
  }, [user, annualContributions.total, assumptions.averageAnnualReturn]);

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
      assumptions.averageAnnualReturn
    );
  }, [user, originalAnnualContributions.total, annualContributions.total, assumptions.averageAnnualReturn]);

  /**
   * Check if any settings have changed from original
   * Optimized with useMemo
   */
  const hasChanges = useMemo(() => {
    return (
      contributionType !== originalValues.type ||
      contributionAmount !== originalValues.amount ||
      age !== originalValues.age ||
      salary !== originalValues.salary ||
      employerMatchRate !== originalValues.employerMatchRate ||
      employerMatchCap !== originalValues.employerMatchCap
    );
  }, [contributionType, contributionAmount, age, salary, employerMatchRate, employerMatchCap, originalValues]);

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
   * Reset all settings to original values
   */
  const reset = useCallback(() => {
    setContributionType(originalValues.type);
    setContributionAmount(originalValues.amount);
    setAge(originalValues.age);
    setSalary(originalValues.salary);
    setEmployerMatchRate(originalValues.employerMatchRate);
    setEmployerMatchCap(originalValues.employerMatchCap);
  }, [originalValues]);

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
    originalValues,

    // Actions
    handleTypeChange,
    handleAmountChange,
    handleAgeChange,
    handleSalaryChange,
    handleEmployerMatchRateChange,
    handleEmployerMatchCapChange,
    reset,
    getMaxAmount,
  };
}

export default useContributionCalculator;
