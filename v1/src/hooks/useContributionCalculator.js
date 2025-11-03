import { useState, useEffect, useMemo } from 'react';
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
 */
export function useContributionCalculator(initialData) {
  // Extract initial values from mock data
  const {
    user,
    contribution: initialContribution,
    ytd,
    limits,
    assumptions,
  } = initialData;

  // State for contribution settings
  const [contributionType, setContributionType] = useState(initialContribution.type);
  const [contributionAmount, setContributionAmount] = useState(initialContribution.amount);

  // Store the original contribution for comparison
  const [originalContribution] = useState({
    type: initialContribution.type,
    amount: initialContribution.amount,
  });

  /**
   * Calculate current annual contributions (employee + employer)
   * Memoized to avoid recalculation on every render
   */
  const annualContributions = useMemo(() => {
    return calculateTotalAnnualContribution(
      contributionType,
      contributionAmount,
      user.salary,
      initialContribution.employerMatchRate,
      initialContribution.employerMatchCap
    );
  }, [contributionType, contributionAmount, user.salary, initialContribution]);

  /**
   * Calculate original annual contributions for comparison
   */
  const originalAnnualContributions = useMemo(() => {
    return calculateTotalAnnualContribution(
      originalContribution.type,
      originalContribution.amount,
      user.salary,
      initialContribution.employerMatchRate,
      initialContribution.employerMatchCap
    );
  }, [originalContribution, user.salary, initialContribution]);

  /**
   * Calculate year-to-date contributions
   */
  const ytdContributions = useMemo(() => {
    return calculateYTDContributions(
      contributionType,
      contributionAmount,
      user.salary,
      initialContribution.employerMatchRate,
      initialContribution.employerMatchCap,
      ytd.monthsElapsed
    );
  }, [contributionType, contributionAmount, user.salary, initialContribution, ytd.monthsElapsed]);

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
   * Check if settings have changed from original
   */
  const hasChanges = useMemo(() => {
    return (
      contributionType !== originalContribution.type ||
      contributionAmount !== originalContribution.amount
    );
  }, [contributionType, contributionAmount, originalContribution]);

  /**
   * Update contribution type and convert amount if needed
   */
  const handleTypeChange = (newType) => {
    if (newType === contributionType) return;

    let newAmount = contributionAmount;

    // Convert between percentage and fixed
    if (newType === 'fixed') {
      // Converting from percentage to fixed (per paycheck)
      const annualAmount = percentageToFixed(contributionAmount, user.salary);
      newAmount = annualAmount / 26; // Biweekly
    } else {
      // Converting from fixed to percentage
      const annualAmount = contributionAmount * 26;
      newAmount = fixedToPercentage(annualAmount, user.salary);
    }

    setContributionType(newType);
    setContributionAmount(Number(newAmount.toFixed(2)));
  };

  /**
   * Update contribution amount with validation
   */
  const handleAmountChange = (newAmount) => {
    // Ensure non-negative
    const validAmount = Math.max(0, Number(newAmount));
    setContributionAmount(validAmount);
  };

  /**
   * Reset to original settings
   */
  const reset = () => {
    setContributionType(originalContribution.type);
    setContributionAmount(originalContribution.amount);
  };

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
    ytdContributions,
    retirementProjection,
    contributionImpact,
    validation,

    // User data
    user,
    limits,
    employerMatch: {
      rate: initialContribution.employerMatchRate,
      cap: initialContribution.employerMatchCap,
    },

    // Actions
    handleTypeChange,
    handleAmountChange,
    reset,
    getMaxAmount,
  };
}

export default useContributionCalculator;
