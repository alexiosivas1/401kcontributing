/**
 * Mock data for 401(k) contribution management application
 *
 * This file contains realistic mock data based on actual 401(k) rules and limits.
 * All calculations assume 2024 IRS contribution limits.
 */

export const mockUserData = {
  // User profile information
  user: {
    name: "Alex Johnson",
    age: 30,
    salary: 75000, // Annual salary in USD
    retirementAge: 65, // Target retirement age
    currentBalance: 45000, // Current 401(k) balance
  },

  // Current contribution settings
  contribution: {
    type: 'percentage', // 'percentage' or 'fixed'
    amount: 10, // 10% or $X depending on type
    employerMatchPercent: 5, // Employer matches 100% up to 5% of salary
    employerMatchLimit: 5, // Maximum match percentage
  },

  // Year-to-date contribution data (assumes we're 9 months into the year)
  ytd: {
    monthsElapsed: 9,
    employeeContributed: 5625, // ($75,000 * 10%) * (9/12) = $5,625
    employerMatched: 2812.50, // ($75,000 * 5%) * (9/12) = $2,812.50
    totalContributed: 8437.50, // Sum of employee + employer
  },

  // IRS contribution limits for 2024
  limits: {
    annual: 23000, // Standard annual limit for under 50
    catchUp: 7500, // Additional catch-up for 50+
    maxAge: 50, // Age when catch-up contributions allowed
  },

  // Assumptions for projections
  assumptions: {
    averageAnnualReturn: 0.07, // 7% average annual return (conservative)
    inflationRate: 0.03, // 3% annual inflation
    salaryGrowthRate: 0.03, // 3% annual salary increases
  },
};

/**
 * Get the maximum contribution percentage based on salary
 * Ensures contributions don't exceed IRS limits
 */
export function getMaxContributionPercent(salary, age, limits) {
  const applicableLimit = age >= limits.maxAge
    ? limits.annual + limits.catchUp
    : limits.annual;

  return Math.min(100, (applicableLimit / salary) * 100);
}

/**
 * Get current contribution limit based on age
 */
export function getContributionLimit(age, limits) {
  return age >= limits.maxAge
    ? limits.annual + limits.catchUp
    : limits.annual;
}

/**
 * Calculate YTD contributions based on current settings
 * Useful for projecting what the rest of the year looks like
 */
export function calculateRemainingYearProjection(salary, contributionPercent, monthsElapsed) {
  const monthsRemaining = 12 - monthsElapsed;
  const annualContribution = salary * (contributionPercent / 100);
  const monthlyContribution = annualContribution / 12;

  return {
    monthlyAmount: monthlyContribution,
    remainingYearTotal: monthlyContribution * monthsRemaining,
    projectedYearEndTotal: annualContribution,
  };
}

export default mockUserData;
