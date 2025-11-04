/**
 * Graph calculations for contribution projection visualizations
 *
 * These functions generate data points for charts showing:
 * - YTD (year-to-date) contributions by month
 * - Long-term retirement projections by year
 * - Compound interest growth over time
 */

/**
 * Generate monthly projection data for YTD and near-term view
 *
 * @param {number} currentBalance - Current 401(k) balance
 * @param {number} annualEmployeeContribution - Employee contribution per year (for future projections)
 * @param {number} annualEmployerContribution - Employer match per year (for future projections)
 * @param {number} monthsElapsed - How many months have passed this year (0-11)
 * @param {number} annualReturnRate - Expected annual return rate (e.g., 0.07 for 7%)
 * @param {number} monthsToProject - Total months to project (default: 12 for one year)
 * @param {Object} actualYTDContributions - Actual historical YTD contributions (required)
 * @returns {Array} Array of data points with month, contributions, and balance
 */
export function generateMonthlyProjection(
  currentBalance,
  annualEmployeeContribution,
  annualEmployerContribution,
  monthsElapsed,
  annualReturnRate = 0.07,
  monthsToProject = 12,
  actualYTDContributions
) {
  const monthlyRate = annualReturnRate / 12;

  // For future months, use the new contribution settings
  const futureMonthlyEmployee = annualEmployeeContribution / 12;
  const futureMonthlyEmployer = annualEmployerContribution / 12;

  // Use ACTUAL YTD data to determine what was contributed historically
  const actualMonthlyEmployee = actualYTDContributions.employeeContributed / monthsElapsed;
  const actualMonthlyEmployer = actualYTDContributions.employerMatched / monthsElapsed;
  const actualMonthlyTotal = actualMonthlyEmployee + actualMonthlyEmployer;

  // Work backwards from current balance using ACTUAL contributions
  const growthFactor = Math.pow(1 + monthlyRate, monthsElapsed);
  const contributionGrowth = actualMonthlyTotal * ((growthFactor - 1) / monthlyRate);
  const startOfYearBalance = (currentBalance - contributionGrowth) / growthFactor;

  const data = [];

  for (let month = 0; month <= monthsToProject; month++) {
    let employeeContributed;
    let employerContributed;
    let balance;

    if (month <= monthsElapsed) {
      // Past months: use ACTUAL contribution rates
      employeeContributed = actualMonthlyEmployee * month;
      employerContributed = actualMonthlyEmployer * month;

      // Build balance from start of year using actual contributions
      const growth = Math.pow(1 + monthlyRate, month);
      const contributions = month > 0
        ? (actualMonthlyEmployee + actualMonthlyEmployer) * ((growth - 1) / monthlyRate)
        : 0;
      balance = startOfYearBalance * growth + contributions;
    } else {
      // Future months: use NEW contribution settings from UI
      const monthsInFuture = month - monthsElapsed;
      employeeContributed = actualMonthlyEmployee * monthsElapsed + futureMonthlyEmployee * monthsInFuture;
      employerContributed = actualMonthlyEmployer * monthsElapsed + futureMonthlyEmployer * monthsInFuture;

      // Project forward from current balance
      const growth = Math.pow(1 + monthlyRate, monthsInFuture);
      const futureContributions = (futureMonthlyEmployee + futureMonthlyEmployer) * ((growth - 1) / monthlyRate);
      balance = currentBalance * growth + futureContributions;
    }

    const totalContributed = employeeContributed + employerContributed;
    const growth = balance - startOfYearBalance - totalContributed;

    data.push({
      month,
      label: `Month ${month}`,
      employee: employeeContributed,
      employer: employerContributed,
      total: totalContributed,
      balance: Math.round(balance),
      growth: Math.round(growth),
      startingBalance: Math.round(startOfYearBalance),
      isProjected: month > monthsElapsed,
    });
  }

  return data;
}

/**
 * Generate yearly projection data for long-term retirement view
 *
 * @param {number} currentBalance - Current 401(k) balance
 * @param {number} currentAge - Current age
 * @param {number} retirementAge - Target retirement age
 * @param {number} annualEmployeeContribution - Employee contribution per year
 * @param {number} annualEmployerContribution - Employer match per year
 * @param {number} annualReturnRate - Expected annual return rate (e.g., 0.07 for 7%)
 * @returns {Array} Array of data points with year, age, contributions, and balance
 */
export function generateYearlyProjection(
  currentBalance,
  currentAge,
  retirementAge,
  annualEmployeeContribution,
  annualEmployerContribution,
  annualReturnRate = 0.07
) {
  const yearsToRetirement = retirementAge - currentAge;
  const data = [];

  let balance = currentBalance;
  let cumulativeEmployee = 0;
  let cumulativeEmployer = 0;

  // Add starting point (year 0)
  const startingBalance = balance;
  data.push({
    year: 0,
    age: currentAge,
    label: `Age ${currentAge}`,
    employee: 0,
    employer: 0,
    total: 0,
    balance: Math.round(balance),
    growth: 0, // No growth yet at starting point
    startingBalance: Math.round(startingBalance),
    isProjected: false,
  });

  // Project forward year by year
  for (let year = 1; year <= yearsToRetirement; year++) {
    // Add this year's contributions
    cumulativeEmployee += annualEmployeeContribution;
    cumulativeEmployer += annualEmployerContribution;
    const annualContribution = annualEmployeeContribution + annualEmployerContribution;

    // Apply growth: previous balance grows, then add this year's contribution
    balance = balance * (1 + annualReturnRate) + annualContribution;

    // Calculate growth from investments
    const totalContributions = cumulativeEmployee + cumulativeEmployer;
    const growth = balance - startingBalance - totalContributions;

    data.push({
      year,
      age: currentAge + year,
      label: `Age ${currentAge + year}`,
      employee: Math.round(cumulativeEmployee),
      employer: Math.round(cumulativeEmployer),
      total: Math.round(totalContributions),
      balance: Math.round(balance),
      growth: Math.round(growth),
      startingBalance: Math.round(startingBalance),
      isProjected: true,
    });
  }

  return data;
}

/**
 * Generate max catch-up contribution projection
 * Shows what balance would be if user maxed out contributions from age 50
 * Uses CURRENT contributions before age 50, then MAX contributions at 50+
 * OPTIMIZED: Minimal code, reuses generateYearlyProjection logic
 *
 * @param {number} currentBalance - Current 401(k) balance
 * @param {number} currentAge - User's current age
 * @param {number} retirementAge - Target retirement age
 * @param {number} annualLimit - Standard annual limit ($23,000)
 * @param {number} catchupLimit - Additional catch-up limit ($7,500)
 * @param {number} catchupAge - Age when catch-up kicks in (50)
 * @param {number} employerMatchRate - Employer match rate (e.g., 0.5 for 50%)
 * @param {number} employerMatchCap - Employer match cap as % of salary (e.g., 6)
 * @param {number} salary - Annual salary for employer match calculation
 * @param {number} annualReturnRate - Expected annual return rate (default: 0.07)
 * @param {number} currentEmployeeContribution - User's current annual employee contribution
 * @param {number} currentEmployerContribution - User's current annual employer match
 * @returns {Array} Data points with catchupBalance for each year
 */
export function generateMaxCatchupProjection(
  currentBalance,
  currentAge,
  retirementAge,
  annualLimit,
  catchupLimit,
  catchupAge,
  employerMatchRate,
  employerMatchCap,
  salary,
  annualReturnRate = 0.07,
  currentEmployeeContribution,
  currentEmployerContribution
) {
  const yearsToRetirement = retirementAge - currentAge;
  const data = [];
  let balance = currentBalance;

  // Starting point (year 0)
  data.push({
    year: 0,
    age: currentAge,
    catchupBalance: currentAge >= catchupAge ? Math.round(balance) : null,
  });

  // Project forward year by year
  // Before age 50: Use current contributions (match regular projection)
  // At age 50+: Use max contributions (show catch-up benefit)
  for (let year = 1; year <= yearsToRetirement; year++) {
    const age = currentAge + year;

    let employeeContribution, employerContribution;

    if (age >= catchupAge) {
      // At age 50+: Use max contributions with catch-up
      const maxEmployee = annualLimit + catchupLimit;
      const matchableAmount = Math.min(maxEmployee, salary * (employerMatchCap / 100));
      employeeContribution = maxEmployee;
      employerContribution = matchableAmount * employerMatchRate;
    } else {
      // Before age 50: Use current contributions (so balance matches regular projection)
      employeeContribution = currentEmployeeContribution;
      employerContribution = currentEmployerContribution;
    }

    // Apply growth and contributions
    balance = balance * (1 + annualReturnRate) + employeeContribution + employerContribution;

    data.push({
      year,
      age,
      catchupBalance: age >= catchupAge ? Math.round(balance) : null,
    });
  }

  return data;
}

/**
 * Calculate the difference between two projections for comparison visualization
 *
 * @param {Array} originalData - Original projection data points
 * @param {Array} newData - New projection data points after changes
 * @returns {Object} Comparison object with delta info
 */
export function calculateProjectionComparison(originalData, newData) {
  if (!originalData || !newData || originalData.length !== newData.length) {
    return null;
  }

  const finalOriginal = originalData[originalData.length - 1]?.balance || 0;
  const finalNew = newData[newData.length - 1]?.balance || 0;
  const difference = finalNew - finalOriginal;
  const isIncrease = difference > 0;

  // Create comparison data with deltas
  const comparisonData = newData.map((point, index) => {
    const originalPoint = originalData[index];
    return {
      ...point,
      originalBalance: originalPoint?.balance,
      delta: point.balance - (originalPoint?.balance || 0),
    };
  });

  return {
    data: comparisonData,
    difference,
    isIncrease,
    percentChange: finalOriginal > 0 ? (difference / finalOriginal) * 100 : 0,
  };
}

/**
 * Format data for YTD view (just current year's months)
 *
 * @param {Array} monthlyData - Full monthly projection data
 * @param {number} monthsElapsed - Current month (0-11)
 * @returns {Array} Filtered data for YTD view
 */
export function formatYTDView(monthlyData, monthsElapsed) {
  return monthlyData.filter(point => point.month <= 11);
}

/**
 * Downsample yearly data for better performance on long projections
 * For projections > 20 years, show every N years instead of every year
 *
 * @param {Array} yearlyData - Full yearly projection data
 * @param {number} maxPoints - Maximum number of points to show
 * @returns {Array} Downsampled data
 */
export function downsampleYearlyData(yearlyData, maxPoints = 50) {
  if (yearlyData.length <= maxPoints) {
    return yearlyData;
  }

  const step = Math.ceil(yearlyData.length / maxPoints);
  const downsampled = [];

  // Always include first point
  downsampled.push(yearlyData[0]);

  // Sample at intervals
  for (let i = step; i < yearlyData.length - 1; i += step) {
    downsampled.push(yearlyData[i]);
  }

  // Always include last point
  downsampled.push(yearlyData[yearlyData.length - 1]);

  return downsampled;
}
