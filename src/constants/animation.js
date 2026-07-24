/**
 * Duration/easing for scroll and crossfade transitions (card track slide,
 * page section scroll, hero slide change), so focus movement feels like a
 * smooth glide rather than an instant jump. This is the "settle" transition
 * used for a single, deliberate press.
 */
export const SCROLL_TRANSITION_DURATION = 1000
export const SCROLL_TRANSITION_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

/**
 * Minimum time between two processed navigation steps. Held-key auto-repeat
 * fires far faster than this; repeats arriving sooner are dropped so the row
 * doesn't fly past dozens of items at once ("moving too fast" fix). Tuned for
 * a comfortable ~5-6 steps/sec while a direction key is held down.
 */
export const NAV_THROTTLE_MS = 350

/**
 * If the gap since the previous processed step is under this window, the user
 * is holding the key (fast scroll) rather than tapping. Should sit comfortably
 * above NAV_THROTTLE_MS so throttled held-repeats still register as "fast".
 */
export const FAST_SCROLL_WINDOW_MS = 500

/**
 * Shorter, near-linear transition used while scrolling fast (held key). Each
 * step settles roughly as the next begins, so consecutive steps chain into one
 * continuous glide that keeps pace instead of restarting a long 1000ms ease-out
 * every repeat ("laggy" fix). A single press still uses the full smooth settle.
 */
export const FAST_SCROLL_DURATION = 500
export const FAST_SCROLL_EASING = 'linear'
