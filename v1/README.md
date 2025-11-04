# 401(k) Contribution Manager

A single-page React application for managing 401(k) retirement contributions with real-time projections and interactive visualizations.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# Opens at http://localhost:5173

# Build for production
npm run build
```

## Tech Stack

- **React 19** + **Vite** - Fast development with instant HMR
- **Tailwind CSS** - Utility-first styling, 3.6KB production bundle
- **Recharts** - Interactive charts built on D3
- **Lucide React** - Lightweight icon library (2KB)

## Core Features

- **Dual Input System**: Percentage or fixed dollar contributions with synchronized slider + text input
- **YTD Summary**: Monthly breakdown with employee/employer contribution tracking
- **Retirement Projections**: Interactive graph showing compound interest growth from current age to retirement
- **Catch-Up Contributions**: Visual projection for 50+ age bracket with IRS limit handling
- **Inline Editing**: Click any value (age, salary, match rate, return rate) to edit
- **Comparison View**: Before/after visualization when adjusting contribution rates

## Major Technical Decisions

**1. React + Vite Over Next.js/CRA**
- Single-page app doesn't need routing or SSR
- Vite provides instant dev server (<1s startup) and HMR
- Production bundle: 72KB gzipped

**2. Custom Hooks Pattern Over Redux/Zustand**
- `useContributionCalculator` centralizes all state and financial logic
- App is small enough for `useState` - no external state management needed
- Keeps components purely presentational

**3. Tailwind CSS Over Custom CSS**
- 5-10x faster development than writing custom stylesheets
- Consistent design system without configuration
- Purges unused classes - only 3.6KB in production

**4. Recharts Over Chart.js/Custom Viz**
- Initially built with custom CSS visualizations
- Upgraded to Recharts for richer interactivity (tooltips, hover states)
- Declarative React API fits naturally with component architecture

**5. Aggressive Performance Optimization**
- Memoized all expensive calculations (`useMemo`, `useCallback`)
- Throttled slider updates to 60 FPS with `requestAnimationFrame`
- `React.memo` on all components to prevent unnecessary re-renders
- Result: Smooth interactions even with 40+ year projections

**6. Mock Data Architecture**
- Backend/database fully mocked in `mockData.js`
- Realistic assumptions: $65k salary, 24 years old, $45k current balance
- Uses proper compound interest formula with monthly compounding
- 7% default return rate (conservative S&P 500 historical average)

**7. Financial Accuracy**
- Historical months (0-9) use actual YTD data, never recalculated
- Future months (10-12) and projections use current contribution settings
- This prevents historical data from changing when user adjusts inputs
- Compound interest: `FV = PV × (1+r)^n + PMT × [((1+r)^n - 1) / r]`

## Project Structure

```
src/
├── components/          # 12 React components
│   ├── ContributionTypeToggle.jsx
│   ├── ContributionInput.jsx
│   ├── YTDSummary.jsx
│   ├── RetirementProjection.jsx
│   ├── ContributionGraph.jsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useContributionCalculator.js   # Main state/logic
│   ├── useEditableField.js
│   └── useThrottledCallback.js
├── utils/              # Pure functions
│   ├── mockData.js                    # Test data + IRS limits
│   ├── calculations.js                # Financial formulas
│   └── graphCalculations.js           # Chart data generation
├── App.jsx             # Root component
└── main.jsx            # Entry point
```

## Browser Support

- Chrome 120+, Firefox 121+, Safari 17+, Edge 120+
- Mobile: iOS Safari, Chrome Android
- Requires Node.js 18+ for development

---

**Built with**: React 19, Vite, Tailwind CSS, Recharts
**Bundle Size**: 72KB gzipped
