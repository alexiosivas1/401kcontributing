# Changelog - 401k App Historical Data Fix

## Date
November 3, 2025

## Issue
When users changed contribution values in the UI, the historical line (months 0-9) in the graph would change, which is incorrect. Historical data should remain fixed, and only future projections (months 10-12) should update based on new contribution settings.

## Root Cause
The `generateMonthlyProjection` function in `graphCalculations.js` was calculating the start-of-year balance by working backwards from the current balance using the **current** contribution settings from the UI. When users changed contributions, it recalculated what the start-of-year balance "would have been" with those new settings, causing the entire historical line to shift.

## Solution
Modified the app to use **actual YTD contribution data** from `mockData.ytd` for historical months, and only apply new contribution settings to future months.

---

## Files Modified

### 1. `src/utils/graphCalculations.js`

**Lines changed:** 10-106

**Changes:**
- Added new **required** parameter `actualYTDContributions` to `generateMonthlyProjection` function
- Updated JSDoc to document the new parameter as required
- **Removed all fallback logic** - no defaults, YTD data must be provided
- Split logic into two paths:
  - **Historical months (0-9):** Calculate using ACTUAL YTD contribution data
  - **Future months (10-12):** Calculate using NEW contribution settings from UI
- Calculate start-of-year balance using actual YTD contributions instead of current UI settings
- Extract actual monthly contribution rates from YTD data: `employeeContributed / monthsElapsed`

**Key code sections:**
```javascript
// Line 29: Required parameter (no default value)
actualYTDContributions

// Lines 34-35: Split future contribution calculations
const futureMonthlyEmployee = annualEmployeeContribution / 12;
const futureMonthlyEmployer = annualEmployerContribution / 12;

// Lines 37-45: Use ACTUAL YTD data (no fallback logic)
const actualMonthlyEmployee = actualYTDContributions.employeeContributed / monthsElapsed;
const actualMonthlyEmployer = actualYTDContributions.employerMatched / monthsElapsed;
const actualMonthlyTotal = actualMonthlyEmployee + actualMonthlyEmployer;

// Work backwards from current balance using ACTUAL contributions
const growthFactor = Math.pow(1 + monthlyRate, monthsElapsed);
const contributionGrowth = actualMonthlyTotal * ((growthFactor - 1) / monthlyRate);
const startOfYearBalance = (currentBalance - contributionGrowth) / growthFactor;

// Lines 51-59: Historical months use actual contribution rates
if (month <= monthsElapsed) {
  employeeContributed = actualMonthlyEmployee * month;
  employerContributed = actualMonthlyEmployer * month;
  // Build balance from start of year using actual contributions
}

// Lines 61-69: Future months use NEW contribution settings
else {
  employeeContributed = actualMonthlyEmployee * monthsElapsed + futureMonthlyEmployee * monthsInFuture;
  employerContributed = actualMonthlyEmployer * monthsElapsed + futureMonthlyEmployer * monthsInFuture;
  // Project forward from current balance
}
```

---

### 2. `src/App.jsx`

**Lines changed:** 200

**Changes:**
- Added `ytdData={mockUserData.ytd}` prop to `RetirementProjection` component
- This passes the actual YTD contribution data from mockData down to the component

**Specific change:**
```javascript
<RetirementProjection
  projection={retirementProjection}
  user={user}
  hasChanges={hasChanges}
  annualContributions={annualContributions}
  originalAnnualContributions={originalAnnualContributions}
  monthsElapsed={mockUserData.ytd.monthsElapsed}
  annualReturnRate={mockUserData.assumptions.averageAnnualReturn}
  ytdData={mockUserData.ytd}  // NEW: Pass actual YTD data
/>
```

---

### 3. `src/components/RetirementProjection.jsx`

**Lines changed:** 40, 58, 60, 87, 89

**Changes:**
- Added **required** `ytdData` parameter to component props (line 40)
- Updated `monthlyData` useMemo to pass `ytdData` to `generateMonthlyProjection` (line 58)
- Added `ytdData` to dependency array for `monthlyData` useMemo (line 60)
- Updated `originalMonthlyData` useMemo to pass `ytdData` to `generateMonthlyProjection` (line 87)
- Added `ytdData` to dependency array for `originalMonthlyData` useMemo (line 89)

**Specific changes:**
```javascript
// Line 40: Added required prop (no default value)
ytdData,

// Lines 57-58: Pass ytdData to function
12, // Project full 12 months
ytdData // Pass actual YTD data for historical accuracy

// Line 60: Added to dependency array
}, [user.currentBalance, annualContributions, monthsElapsed, annualReturnRate, ytdData]);

// Lines 86-87: Pass ytdData to function (original data for comparison)
12,
ytdData // Pass actual YTD data for historical accuracy

// Line 89: Added to dependency array
}, [hasChanges, originalAnnualContributions, user.currentBalance, monthsElapsed, annualReturnRate, ytdData]);
```

---

## Impact

### Before Fix:
- Months 0-9: Balance and contributions changed when user adjusted contribution settings ❌
- Historical line would shift up/down based on UI changes
- Confusing user experience - made it look like past data was being recalculated

### After Fix:
- Months 0-9: Balance and contributions remain fixed using actual YTD data ✅
- Historical line stays constant regardless of UI changes
- Only months 10-12 update based on new contribution settings
- Clear separation: past = actual data, future = projected with new settings

---

## Testing Recommendations

1. **Load the app** - Historical line should show growth from ~$37,688 (Jan) to $45,000 (Sep)
2. **Change contribution percentage** (e.g., 10% → 15%)
   - Months 0-9 should NOT change
   - Months 10-12 should update with new projection
3. **Change contribution type** (percentage ↔ fixed dollar)
   - Months 0-9 should remain constant
   - Months 10-12 should recalculate
4. **Reset button** - Should work as expected, showing original projection for future months

---

## Technical Notes

- Implementation uses standard financial formula: `FV = PV × (1+r)^n + PMT × [((1+r)^n - 1) / r]`
- **No fallback logic:** `actualYTDContributions` is a required parameter - YTD data must always be provided
- Minimal code changes: Only 3 files modified, ~30 lines total
- Performance: No impact - calculations remain memoized
- Data source: `mockUserData.ytd` contains actual historical values (required)
  - `employeeContributed: 4875`
  - `employerMatched: 2437.50`
  - `totalContributed: 7312.50`
  - `monthsElapsed: 9`

---

## Author
Claude Code Assistant

## Status
✅ Complete - All changes implemented and documented
