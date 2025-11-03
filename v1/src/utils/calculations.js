/**
 * Financial calculations for 401(k) contribution management
 *
 * All formulas are based on standard retirement planning calculations
 * and follow IRS 401(k) contribution rules.
 */

/**
 * Convert between percentage and fixed dollar contributions
 */
export function percentageToFixed(percentage, salary) {
  return (salary * percentage) / 100;
}

export function fixedToPercentage(fixed, salary) {
  if (salary === 0) return 0;
  return (fixed / salary) * 100;
}

/**
 * Calculate annual employee contribution based on type and amount
 */
export function calculateAnnualContribution(type, amount, salary) {
  if (type === 'percentage') {
    return (salary * amount) / 100;
  }
  // For fixed amount, assume biweekly (26 pay periods per year)
  return amount * 26;
}

/**
 * Calculate employer match contribution
 *
 * Typical structure: Employer matches at a rate up to a cap % of salary
 * Example: 100% match up to 5% means if you contribute 10%, employer contributes 5%
 * Example: 50% match up to 6% means if you contribute 6%, employer contributes 3%
 *
 * @param employeeContribution - Annual employee contribution in dollars
 * @param salary - Annual salary
 * @param employerMatchRate - Match rate as decimal (1.0 = 100%, 0.5 = 50%)
 * @param employerMatchCap - Maximum match as percentage of salary (e.g., 5 for 5%)
 */
export function calculateEmployerMatch(
  employeeContribution,
  salary,
  employerMatchRate,
  employerMatchCap
) {
  // Calculate the match amount based on employee contribution and match rate
  const matchedAmount = employeeContribution * employerMatchRate;

  // Maximum employer will match (in dollars)
  const maxMatch = (salary * employerMatchCap) / 100;

  // Return the lesser of matched amount or the cap
  return Math.min(matchedAmount, maxMatch);
}

/**
 * Calculate total annual contribution (employee + employer)
 */
export function calculateTotalAnnualContribution(
  type,
  amount,
  salary,
  employerMatchRate,
  employerMatchCap
) {
  const employeeContribution = calculateAnnualContribution(type, amount, salary);
  const employerContribution = calculateEmployerMatch(
    employeeContribution,
    salary,
    employerMatchRate,
    employerMatchCap
  );

  return {
    employee: employeeContribution,
    employer: employerContribution,
    total: employeeContribution + employerContribution,
  };
}

/**
 * Calculate year-to-date (YTD) contributions
 */
export function calculateYTDContributions(
  type,
  amount,
  salary,
  employerMatchRate,
  employerMatchCap,
  monthsElapsed
) {
  const annual = calculateTotalAnnualContribution(
    type,
    amount,
    salary,
    employerMatchRate,
    employerMatchCap
  );

  const ratio = monthsElapsed / 12;

  return {
    employee: annual.employee * ratio,
    employer: annual.employer * ratio,
    total: annual.total * ratio,
  };
}

/**
 * Project retirement savings using compound interest formula
 *
 * Formula: FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]
 *
 * Where:
 * - FV = Future Value (retirement balance)
 * - PV = Present Value (current balance)
 * - r = Rate of return per period
 * - n = Number of periods
 * - PMT = Payment per period (annual contribution)
 *
 * We use monthly compounding for more accurate results.
 */
export function calculateRetirementProjection(
  currentBalance,
  annualContribution,
  currentAge,
  retirementAge,
  annualReturnRate = 0.07 // Default 7% annual return
) {
  const yearsToRetirement = retirementAge - currentAge;

  if (yearsToRetirement <= 0) {
    return {
      futureValue: currentBalance,
      totalContributions: 0,
      totalGrowth: 0,
      yearsToRetirement: 0,
    };
  }

  // Use monthly compounding for accuracy
  const monthlyRate = annualReturnRate / 12;
  const monthlyContribution = annualContribution / 12;
  const totalMonths = yearsToRetirement * 12;

  // Future value of current balance
  const futureValueOfCurrentBalance = currentBalance * Math.pow(1 + monthlyRate, totalMonths);

  // Future value of monthly contributions (ordinary annuity)
  const futureValueOfContributions =
    monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);

  const totalFutureValue = futureValueOfCurrentBalance + futureValueOfContributions;
  const totalContributions = annualContribution * yearsToRetirement;
  const totalGrowth = totalFutureValue - currentBalance - totalContributions;

  return {
    futureValue: totalFutureValue,
    totalContributions,
    totalGrowth,
    yearsToRetirement,
  };
}

/**
 * Calculate the impact of changing contribution amount
 * Returns comparison between current and new contribution levels
 */
export function calculateContributionImpact(
  currentBalance,
  currentAnnualContribution,
  newAnnualContribution,
  currentAge,
  retirementAge,
  annualReturnRate = 0.07
) {
  const currentProjection = calculateRetirementProjection(
    currentBalance,
    currentAnnualContribution,
    currentAge,
    retirementAge,
    annualReturnRate
  );

  const newProjection = calculateRetirementProjection(
    currentBalance,
    newAnnualContribution,
    currentAge,
    retirementAge,
    annualReturnRate
  );

  const difference = newProjection.futureValue - currentProjection.futureValue;
  const percentageChange =
    currentProjection.futureValue > 0
      ? (difference / currentProjection.futureValue) * 100
      : 0;

  return {
    current: currentProjection,
    new: newProjection,
    difference,
    percentageChange,
  };
}

/**
 * Validate contribution amount against IRS limits
 */
export function validateContribution(annualContribution, age, limits) {
  const applicableLimit = age >= limits.maxAge
    ? limits.annual + limits.catchUp
    : limits.annual;

  const isValid = annualContribution <= applicableLimit;
  const isNearLimit = annualContribution > applicableLimit * 0.9; // Within 90% of limit
  const excessAmount = Math.max(0, annualContribution - applicableLimit);

  return {
    isValid,
    isNearLimit,
    excessAmount,
    applicableLimit,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount, decimals = 0) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with abbreviations (K, M)
 */
export function formatLargeNumber(num) {
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(0)}K`;
  }
  return formatCurrency(num, 0);
}
