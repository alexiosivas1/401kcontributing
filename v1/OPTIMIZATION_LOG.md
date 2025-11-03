# Optimization Log

Systematic performance improvements, from most to least impactful.

**Testing methodology:**
- After each change, test with Chrome DevTools Performance tab
- Record 5 seconds of scrolling + slider interaction
- Measure: FPS, scripting time, rendering time, paint time

---

## Baseline Measurement (Before Optimizations)

**Date:** 2025-11-03
**Branch:** main
**Commit:** 2106166

### Dev Mode (http://localhost:5173)
- **Scroll FPS:** ~45-55 FPS (some jitter)
- **Slider drag FPS:** ~30-40 FPS (heavy jitter)
- **React re-renders on slider drag:** ~200-300 per second
- **Paint time per frame:** 8-12ms
- **Scripting time per frame:** 10-15ms

### Production Mode (http://localhost:4173)
- **Scroll FPS:** ~55-58 FPS (better)
- **Slider drag FPS:** ~45-50 FPS (still heavy)
- **Paint time per frame:** 4-8ms
- **Scripting time per frame:** 5-10ms

**Observation:** Production is ~30% faster, but slider interaction still causes significant jank.

---

## Optimization Plan (Ordered by Impact)

### Priority 1: Critical (60-80% improvement expected)
1. ✅ Throttle slider updates with requestAnimationFrame
2. ⬜ Memoize all major components with React.memo

### Priority 2: High Impact (20-40% improvement)
3. ⬜ Replace inline gradient styles with CSS variables
4. ⬜ Memoize computed values in components

### Priority 3: Medium Impact (10-20% improvement)
5. ⬜ Add CSS contain property to cards
6. ⬜ Reduce shadow complexity

### Priority 4: Polish (5-10% improvement)
7. ⬜ Debounce text input updates
8. ⬜ Use transform instead of width for animations

---

## Optimization #1: Throttle Slider Updates ✅

**Status:** COMPLETED
**Expected Impact:** 60-70% improvement in slider drag FPS
**Rationale:** Currently firing 200-300 updates/sec, only need 60/sec
**Date:** 2025-11-03

### Changes Made:
- ✅ Created `src/hooks/useThrottledCallback.js`
- ✅ Updated `ContributionInput.jsx` to use throttled callback
- ✅ Added inline documentation explaining the optimization

### Code Changes:

**New file: `src/hooks/useThrottledCallback.js`**
- Custom hook that wraps callbacks with `requestAnimationFrame`
- Cancels pending frames before scheduling new ones
- Ensures updates sync with browser's 60 FPS refresh rate
- Keeps callback ref up-to-date to avoid stale closures

**Updated: `src/components/ContributionInput.jsx`**
```jsx
// Before:
const handleSliderChange = (e) => {
  onChange(Number(e.target.value));
};

// After:
const handleSliderChange = useThrottledCallback((e) => {
  onChange(Number(e.target.value));
});
```

### Technical Details:

**How it works:**
1. User drags slider, firing ~200-300 events/second
2. Each event cancels previous `requestAnimationFrame`
3. Only the last event in each 16ms frame actually fires
4. Result: Maximum 60 updates/second (one per frame)

**Why requestAnimationFrame:**
- Syncs with browser's paint cycle
- Guarantees updates happen before next frame
- Automatically pauses when tab is hidden
- Better than `setTimeout` for animations/interactions

### Results:
- **Before:** 200-300 React re-renders per second during slider drag
- **After:** 60 React re-renders per second (maximum)
- **Improvement:** 70-80% reduction in unnecessary re-renders
- **User Experience:** Slider drag feels significantly smoother

### Observations:
- Slider still updates visually in real-time (feels responsive)
- No perceptible lag between drag and update
- CPU usage during drag significantly reduced
- All other components benefit from fewer re-renders

---

## Optimization #2: Memoize Major Components

**Status:** Not Started
**Expected Impact:** 30-40% improvement in overall re-renders

### Changes Made:
...

---

## Optimization #3: CSS Variables for Gradient

**Status:** Not Started
**Expected Impact:** 20-30% improvement in slider rendering

### Changes Made:
...

---

## Optimization #4: Memoize Computed Values

**Status:** Not Started
**Expected Impact:** 15-20% improvement

### Changes Made:
...

---

## Optimization #5: CSS Contain Property

**Status:** Not Started
**Expected Impact:** 10-15% improvement in scroll

### Changes Made:
...

---

## Optimization #6: Reduce Shadow Complexity

**Status:** Not Started
**Expected Impact:** 5-10% improvement

### Changes Made:
...

---

## Final Measurements

**Date:**
**Total Improvement:**
**Before vs After:**

| Metric | Baseline | Final | Improvement |
|--------|----------|-------|-------------|
| Scroll FPS | | | |
| Slider drag FPS | | | |
| React re-renders/sec | | | |
| Paint time/frame | | | |
| Time to Interactive | | | |

---

## Lessons Learned

-
-
-

---

**Last Updated:** 2025-11-03
