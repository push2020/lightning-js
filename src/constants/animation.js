/**
 * Duration/easing for scroll and crossfade transitions (card track slide,
 * page section scroll, hero slide change), so focus movement feels like a
 * smooth glide rather than an instant jump. This is the "settle" transition
 * used for a single, deliberate press.
 */
export const SCROLL_TRANSITION_DURATION = 1000
export const SCROLL_TRANSITION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

/**
 * Delay (ms) after a poster card mounts before it loads its image, so a single
 * deliberate scroll step reads as a smooth settle rather than an instant pop-in.
 * During a held/fast scroll the load is deferred further, until the scroll
 * settles and the off-screen rows have been dropped (see helpers/loadGate.js),
 * so only cards actually in the viewport load. Kept short enough that a normal
 * press still feels responsive.
 */
export const IMAGE_LOAD_DELAY = 280

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
  throttleMs: 200,
  fastWindowMs: 220,
  fastDuration: 280,
  fastEasing: 'linear',
  settleDuration: SCROLL_TRANSITION_DURATION,
  settleEasing: SCROLL_TRANSITION_EASING,
}

export const HORIZONTAL_SCROLL = {
  throttleMs: 100,
  fastWindowMs: 120,
  fastDuration: 150,
  fastEasing: 'linear',
  settleDuration: SCROLL_TRANSITION_DURATION,
  settleEasing: SCROLL_TRANSITION_EASING,
}

/**
 * Held-scroll tuning for the hero carousel. Same fields as above, but here the
 * transition is a crossfade (slide alpha) rather than a translate: fastDuration/
 * settleDuration are the fade lengths. Held Left/Right paging drops repeats
 * arriving faster than throttleMs and uses the shorter fade so slides don't pile
 * up half-dissolved on top of each other; a single press keeps the full settle
 * fade. A shorter fastDuration reads cleaner here than for a translating rail,
 * since long crossfades overlap more slides.
 */
export const HERO_SCROLL = {
  throttleMs: 200,
  fastWindowMs: 400,
  fastDuration: 200,
  fastEasing: 'linear',
  settleDuration: SCROLL_TRANSITION_DURATION,
  settleEasing: SCROLL_TRANSITION_EASING,
}

/**
 * Focus "lift": the selected card in the focused rail rises by `offset` px with
 * a short ease-out, giving a hover-lift/pop as focus lands on it. The rail's
 * fixed focus border is offset up by the same amount so it keeps framing the
 * lifted card (see ContentRail.js / PageContainer.js). Kept quick (shorter than
 * the scroll settle) so the card pops as it slides into the focus slot.
 */
export const CARD_LIFT = {
  offset: 20,
  duration: 220,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
}
