/**
 * Coordinates deferred poster-image loading with scroll motion.
 *
 * The problem: every PosterCard used to load its texture the moment it was
 * mounted. During a fast vertical scroll the virtualization window grows to
 * cover every rail passed over, so dozens of textures start downloading and
 * decoding at once mid-scroll - the cause of the stutter.
 *
 * The fix: while a held/fast scroll is in progress, cards postpone loading
 * their image. Nav code calls markFastScroll() on each fast step; the existing
 * window-compaction callbacks (which run once motion settles and have already
 * dropped the rows/cards that were only flown past) call notifySettled(). At
 * that point only the cards still mounted - i.e. the ones actually in the
 * viewport - are told to load. Loaded textures use keepAlive, so they stay
 * resident and never reload on a later scroll.
 */

/** Whether a held/fast scroll is currently in progress. */
let fastScrolling = false

/** Fallback timer so fastScrolling can never get stuck on. */
let safetyTimer = null

/** Cards waiting for the current scroll to settle before loading. */
const settledSubscribers = new Set()

/**
 * Upper bound on how long we'll stay in the "fast scrolling" state without a
 * compaction callback clearing it. Kept above the scroll settle/compaction
 * delay so it only ever acts as a safety net, never as the primary trigger.
 */
const SETTLE_SAFETY_MS = 2000

/**
 * Marks that a fast/held scroll step just happened, so cards mounting during
 * the burst defer their image load until the scroll settles.
 * @returns {void}
 */
export function markFastScroll() {
  fastScrolling = true
  clearTimeout(safetyTimer)
  safetyTimer = setTimeout(notifySettled, SETTLE_SAFETY_MS)
}

/**
 * Whether a fast/held scroll is currently in progress.
 * @returns {boolean}
 */
export function isFastScrolling() {
  return fastScrolling
}

/**
 * Signals that a scroll has settled and the virtualization window has been
 * compacted. Clears the fast-scroll flag and lets every waiting card load.
 * @returns {void}
 */
export function notifySettled() {
  clearTimeout(safetyTimer)
  safetyTimer = null
  fastScrolling = false
  if (settledSubscribers.size === 0) return
  const pending = [...settledSubscribers]
  settledSubscribers.clear()
  for (const fn of pending) fn()
}

/**
 * Notifies settle on a later frame. A compaction callback shrinks the
 * virtualization window by mutating state, but Blits only tears down the
 * now-off-screen cards on the next render. Waiting two frames guarantees those
 * flown-past cards have unsubscribed before we release the load, so only cards
 * still in the viewport are told to load.
 * @returns {void}
 */
export function scheduleSettle() {
  requestAnimationFrame(() => {
    requestAnimationFrame(notifySettled)
  })
}

/**
 * Registers a callback fired once the current scroll settles. Returns an
 * unsubscribe function so a card scrolled out of range before settling can
 * drop its pending load.
 * @param {() => void} fn - called when the scroll settles
 * @returns {() => void} unsubscribe
 */
export function onSettled(fn) {
  settledSubscribers.add(fn)
  return () => {
    settledSubscribers.delete(fn)
  }
}
