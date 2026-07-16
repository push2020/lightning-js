/**
 * Shared animation timing constants, so every component animates in sync
 * with the same premium, TV-appropriate rhythm (roughly 200ms - 800ms).
 */
export const DURATION = {
  fast: 200,
  base: 300,
  slow: 500,
  hero: 800,
}

/**
 * Shared easing curves used across focus, scroll and hero transitions.
 */
export const EASING = {
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
}

/**
 * Builds a Blits transition config object with sensible animation defaults.
 * @param {number|string} value - target value for the transitioned property
 * @param {{duration?: number, easing?: string, delay?: number}} [options] - overrides
 * @returns {{value: number|string, duration: number, easing: string, delay: number}}
 */
export function transition(value, options = {}) {
  return {
    value,
    duration: options.duration || DURATION.base,
    easing: options.easing || EASING.smooth,
    delay: options.delay || 0,
  }
}
