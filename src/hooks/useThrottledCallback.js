import { useCallback, useRef } from 'react';

/**
 * Custom hook to throttle callbacks using requestAnimationFrame
 *
 * This ensures updates are synchronized with the browser's refresh rate (60 FPS),
 * preventing excessive re-renders and improving performance.
 *
 * Use case: Slider input that fires hundreds of events per second
 * Without throttling: 200-300 updates/second
 * With throttling: 60 updates/second (one per frame)
 *
 * @param {Function} callback - The function to throttle
 * @returns {Function} - Throttled version of the callback
 *
 * @example
 * const handleChange = useThrottledCallback((value) => {
 *   setState(value);
 * });
 */
export function useThrottledCallback(callback) {
  const rafId = useRef(null);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  callbackRef.current = callback;

  return useCallback((...args) => {
    // Cancel any pending animation frame
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }

    // Schedule callback for next animation frame
    rafId.current = requestAnimationFrame(() => {
      callbackRef.current(...args);
      rafId.current = null;
    });
  }, []);
}

export default useThrottledCallback;
