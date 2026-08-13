import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 (or its previous value) up to `targetValue` using
 * requestAnimationFrame and an ease-out curve. No dependency needed — this is
 * the Phase 1 "count-up" motion primitive (see Part G.1 of the redesign brief).
 *
 * @param {number} targetValue
 * @param {number} durationMs
 * @returns {number} the animated intermediate value, rounded to the nearest integer
 */
export function useCountUp(targetValue, durationMs = 600) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number.isFinite(targetValue) ? targetValue : 0;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / durationMs, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;
      setValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetValue, durationMs]);

  return Math.round(value);
}
