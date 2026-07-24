/**
 * Duration/easing for scroll and crossfade transitions (card track slide,
 * page section scroll, hero slide change), so focus movement feels like a
 * smooth glide rather than an instant jump. This is the "settle" transition
 * used for a single, deliberate press.
 */
export const SCROLL_TRANSITION_DURATION = 1000
export const SCROLL_TRANSITION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

/**
 * Held-scroll tuning, kept separate per axis so vertical (page section) and
 * horizontal (card rail) navigation can be slowed/smoothed independently.
 *
 * Fields:
 * - throttleMs: minimum time between two processed steps. Held-key auto-repeat
 *   fires far faster; repeats arriving sooner are dropped so the view doesn't
 *   fly past items ("too fast" fix). Higher = slower cadence.
 * - fastWindowMs: if the gap since the previous step is under this, the user is
 *   holding the key (fast scroll) rather than tapping. Keep ABOVE throttleMs so
 *   throttled held-repeats still register as "fast".
 * - fastDuration/fastEasing: the glide used while scrolling fast, so steps chain
 *   into one continuous motion instead of restarting the long settle every
 *   repeat ("laggy" fix). Keep fastDuration ≈ throttleMs. A single press still
 *   uses settleDuration/settleEasing.
 * - settleDuration/settleEasing: the smooth transition for a single, deliberate
 *   press (and the resting step after a held scroll).
 */
export const VERTICAL_SCROLL = {
  throttleMs: 350,
  fastWindowMs: 500,
  fastDuration: 450,
  fastEasing: 'linear',
  settleDuration: SCROLL_TRANSITION_DURATION,
  settleEasing: SCROLL_TRANSITION_EASING,
}

export const HORIZONTAL_SCROLL = {
  throttleMs: 220,
  fastWindowMs: 500,
  fastDuration: 300,
  fastEasing: 'linear',
  settleDuration: SCROLL_TRANSITION_DURATION,
  settleEasing: SCROLL_TRANSITION_EASING,
}
