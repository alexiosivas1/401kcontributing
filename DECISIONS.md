# Technical Decisions Log

This document tracks all technical decisions made during the development of the 401(k) Contribution Management SPA, along with the rationale for each choice.

---

## Tech Stack Decisions

### 1. Framework: React 18 with Vite
**Decision Date:** 2025-11-03
**Rationale:**
- **Setup Speed:** `npm create vite` provides instant project scaffolding
- **Development Experience:** Hot Module Replacement (HMR) is lightning-fast with Vite
- **Industry Standard:** React demonstrates real-world, production-ready skills
- **User Familiarity:** Interviewer is comfortable with React, enabling rapid development
- **Build Performance:** Vite uses esbuild for 10-100x faster builds than webpack
- **Zero Configuration:** Works out of the box without complex config

**Alternatives Considered:**
- Vue 3: Cleaner syntax but less widespread in industry
- Vanilla JS: Maximum control but slower development for complex UIs
- Next.js: Overkill for a client-only SPA with no routing needs

---

### 2. Styling: Tailwind CSS
**Decision Date:** 2025-11-03
**Rationale:**
- **Development Speed:** Utility-first CSS = 5-10x faster than writing custom CSS
- **Consistency:** Built-in design system ensures professional, cohesive UI
- **Responsive Design:** Mobile-first utilities (`sm:`, `md:`, `lg:`) built in
- **Bundle Size:** PurgeCSS removes unused styles in production
- **No Context Switching:** Style components without leaving JSX
- **Professional Look:** Easy to create polished, modern interfaces quickly

**Configuration:**
- Custom primary color palette for financial app aesthetic (blues)
- Reusable component classes (`.card`, `.input-field`, `.btn-primary`)
- Extended font family configuration for better typography

**Alternatives Considered:**
- Vanilla CSS: Full control but 10x slower to write
- CSS Modules: Good encapsulation but more boilerplate
- Styled-components: Runtime overhead and slower build times
- CSS-in-JS: Adds bundle size and complexity

---

### 3. State Management: React Hooks (No External Library)
**Decision Date:** 2025-11-03
**Rationale:**
- **Simplicity:** App is small enough for `useState` + `useContext` if needed
- **Zero Dependencies:** No Redux/Zustand means faster builds and smaller bundle
- **Custom Hook Pattern:** `useContributionCalculator` centralizes logic cleanly
- **Easier Testing:** Pure functions are easier to test than Redux actions/reducers
- **No Boilerplate:** No need for actions, reducers, providers, or store setup

**State Structure:**
```javascript
{
  contributionType: 'percentage' | 'fixed',
  contributionAmount: number,
  errors: {},
  projections: {...}
}
```

**Alternatives Considered:**
- Redux: Massive overkill for this app size
- Zustand: Good but unnecessary for single-page app
- Jotai/Recoil: Atomic state is interesting but adds learning curve

---

### 4. No Chart Library (Initially)
**Decision Date:** 2025-11-03
**Rationale:**
- **Bundle Size:** Chart.js = ~200KB, Recharts = ~150KB (too heavy)
- **Time Efficiency:** Custom CSS progress bars can be built in 15 minutes
- **Flexibility:** Full control over styling and animations
- **Performance:** Native CSS is faster than canvas/SVG libraries
- **Demonstrates Skills:** Shows ability to build custom solutions

**Custom Visualization Approach:**
- Progress bars with CSS gradients
- Percentage-based widths for visual comparison
- Smooth transitions with CSS animations
- Color coding for different contribution types

**Future Consideration:**
If time permits after core features, may add lightweight charting for:
- Retirement savings growth projection over time
- Contribution breakdown (employee vs employer)

---

### 5. No Routing Library
**Decision Date:** 2025-11-03
**Rationale:**
- **Single Page App:** All features fit on one screen/page
- **No Navigation:** No need for React Router or other routing
- **Simpler Mental Model:** Everything is visible at once
- **Faster Load:** No code splitting or lazy loading needed

---

### 6. Development Tools
**Decision Date:** 2025-11-03

#### ESLint & Prettier: NOT INCLUDED (Yet)
**Rationale:**
- **Time Constraint:** Setup takes 15-20 minutes, slows initial development
- **Manual Review:** Can manually review code quality
- **Future Addition:** Can add later if time permits

#### Git: YES
**Rationale:**
- **Version Control:** Essential for tracking changes
- **Professional Practice:** Shows good engineering habits
- **Commit History:** Documents development process

---

## Architecture Decisions

### 7. Component Structure
**Decision Date:** 2025-11-03
**Approach:** Small, focused components following Single Responsibility Principle

**Component Hierarchy:**
```
App
├── ContributionTypeToggle ($ vs % selector)
├── ContributionInput (slider + text input combo)
├── YTDSummary (year-to-date contribution display)
├── RetirementProjection (savings calculator)
└── ImpactVisualization (before/after comparison)
```

**Benefits:**
- Easy to test individual components
- Reusable and composable
- Clear separation of concerns
- Simple prop drilling (no need for context)

---

### 8. Data Flow Pattern
**Decision Date:** 2025-11-03
**Pattern:** Unidirectional data flow (state down, events up)

```
App (state)
  ↓ props
Components
  ↑ callbacks
App (state update)
```

**Benefits:**
- Predictable data flow
- Easy to debug
- Standard React pattern
- No prop drilling issues with shallow hierarchy

---

## Feature Implementation Decisions

### 9. Dual Input System (Slider + Text)
**Decision Date:** 2025-11-03
**Rationale:**
- **Slider:** Quick adjustments, visual feedback
- **Text Input:** Precise control for exact amounts
- **Sync Both Ways:** Changes in either update the other
- **Better UX:** Combines speed and precision

**Implementation:**
- Range input for slider (HTML5 native)
- Number input for text field
- onChange handlers keep both synchronized
- Debouncing not needed (instant updates are fine)

---

### 10. Mock Data Structure
**Decision Date:** 2025-11-03
**Structure:**
```javascript
{
  user: {
    age: 30,
    salary: 75000,
    retirementAge: 65,
    currentBalance: 45000
  },
  contribution: {
    type: 'percentage',
    amount: 10,
    employerMatchPercent: 5,
    employerMatchLimit: 5,
    ytdContributed: 5625,
    ytdEmployerMatch: 2812.50
  },
  limits: {
    annual2024: 23000,
    catchUp50Plus: 7500
  }
}
```

**Rationale:**
- Realistic numbers based on actual 401(k) rules
- Comprehensive enough to demonstrate calculations
- Simple enough to understand quickly
- Shows product knowledge of retirement plans

---

### 11. Retirement Calculation Formula
**Decision Date:** 2025-11-03
**Formula:** Future Value with Compound Interest

```javascript
FV = PV × (1 + r)^n + PMT × [((1 + r)^n - 1) / r]

Where:
- FV = Future Value (retirement balance)
- PV = Present Value (current balance)
- r = Annual return rate (assumed 7%)
- n = Years until retirement
- PMT = Annual contribution (employee + employer match)
```

**Assumptions:**
- 7% average annual return (historical S&P 500 average)
- Monthly compounding (more accurate than annual)
- Consistent contribution rate until retirement
- No inflation adjustment (nominal dollars)

**Why 7%?**
- Conservative estimate based on historical data
- Accounts for market volatility
- Industry standard for retirement calculators

---

### 12. Employer Match Logic
**Decision Date:** 2025-11-03
**Implementation:**
```javascript
employerMatch = min(
  employeeContribution,
  salary × (employerMatchPercent / 100)
)
```

**Rationale:**
- Typical employer match: "100% up to X% of salary"
- Example: 100% match up to 5% = employer contributes 5% if you contribute ≥5%
- Shows understanding of real 401(k) mechanics

---

### 13. Form Validation Strategy
**Decision Date:** 2025-11-03
**Validation Rules:**
1. **Amount Range:**
   - Percentage: 0% - 100%
   - Fixed: $0 - annual salary
2. **IRS Limits:**
   - Annual contribution ≤ $23,000 (2024)
   - Show warning when approaching limit
3. **Real-time Validation:**
   - Validate on change (instant feedback)
   - Show error messages inline
   - Disable invalid states

**UI Patterns:**
- Red border for invalid inputs
- Helper text shows limits
- Warning badge for approaching limits
- Success state for valid contributions

---

### 14. Responsive Design Breakpoints
**Decision Date:** 2025-11-03
**Breakpoints:**
- Mobile: < 640px (sm) - Single column
- Tablet: 640px - 1024px (md) - Two column grid
- Desktop: ≥ 1024px (lg) - Three column grid with sidebar

**Mobile-First Approach:**
- Base styles for mobile
- Add complexity with `sm:`, `md:`, `lg:` prefixes
- Stack cards vertically on small screens
- Horizontal layout on larger screens

---

### 15. Accessibility Features
**Decision Date:** 2025-11-03
**Requirements:**
- ARIA labels on all interactive elements
- Keyboard navigation support (Tab, Enter, Space)
- Focus indicators on all inputs
- Semantic HTML (`<main>`, `<section>`, `<label>`)
- Sufficient color contrast (WCAG AA compliance)
- Screen reader friendly text for numbers/currency

**Implementation:**
```jsx
<input
  type="range"
  aria-label="Contribution amount"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-valuenow={amount}
/>
```

---

## Future Enhancements (Time Permitting)

### Potential Additions:
1. **Traditional vs Roth Toggle:** Tax implications calculator
2. **Historical Performance Chart:** Show growth over years
3. **What-If Scenarios:** Compare multiple contribution strategies
4. **Catch-Up Contributions:** For users 50+ years old
5. **Print/Export Feature:** Save projection as PDF
6. **Dark Mode:** Toggle for light/dark theme
7. **Animation Library:** Framer Motion for smooth number transitions

---

## Performance Considerations

### Bundle Size Targets:
- **Goal:** < 150KB gzipped JavaScript
- **Tailwind:** ~10KB after purging unused styles
- **React:** ~40KB (React + ReactDOM)
- **App Code:** < 30KB
- **Total:** Well under 100KB ✓

### Load Time Targets:
- **Initial Load:** < 1 second on 3G
- **Interactive:** < 2 seconds on 3G
- **No spinners needed:** Everything loads instantly

---

## Testing Strategy

### Manual Testing Checklist:
- [ ] Toggle between $ and % modes
- [ ] Slider and text input stay synchronized
- [ ] YTD calculations are accurate
- [ ] Retirement projections calculate correctly
- [ ] Employer match calculates correctly
- [ ] Form validation works (min/max, limits)
- [ ] Responsive on mobile, tablet, desktop
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] No console errors
- [ ] Fast performance (no lag)

### Test Cases:
1. **Edge Cases:**
   - 0% contribution
   - 100% contribution
   - Exceeding IRS limits
   - Negative numbers (should be prevented)
2. **Calculations:**
   - Verify math with calculator
   - Check edge cases (age 64 → 65)
   - Employer match edge cases

---

## Lessons Learned

*This section will be updated as development progresses...*

---

**Last Updated:** 2025-11-03
**Developer:** Claude (AI Assistant)
**Project:** Human Interest 401(k) Take-Home Assignment
