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
    age: 24,
    salary: 65000, // Annual salary in USD
    retirementAge: 65, // Target retirement age
    currentBalance: 45000, // Current 401(k) balance
  },

  // Current contribution settings
  contribution: {
    type: 'percentage', // 'percentage' or 'fixed'
    amount: 10, // 10% or $X depending on type
    employerMatchRate: 1.0, // Match rate: 1.0 = 100% match, 0.5 = 50% match
    employerMatchCap: 5, // Maximum match: 5% of salary
  },

  // Year-to-date contribution data (assumes we're 9 months into the year)
  ytd: {
    monthsElapsed: 9,
    employeeContributed: 4875, // ($65,000 * 10%) * (9/12) = $4,875
    employerMatched: 2437.50, // ($65,000 * 5%) * (9/12) = $2,437.50
    totalContributed: 7312.50, // Sum of employee + employer
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

export default mockUserData;
