/**
 * Remembers which poster images have already finished loading during this
 * session, keyed by image URL.
 *
 * Cards are virtualized - a rail scrolled out of view is unmounted to keep
 * memory bounded, and remounted when scrolled back. Without this registry a
 * remounted card would start blank and re-show its skeleton (plus the load
 * delay) before revealing the image again, even though the decoded texture is
 * still resident via keepAlive. Recording the URL on first load lets a
 * remount render the image immediately, so an image that has loaded once is
 * never visibly removed or reloaded again.
 */

/** URLs of poster images that have finished loading at least once. */
const loadedImages = new Set()

/**
 * Records that the given image URL has finished loading.
 * @param {string} src - the image URL
 * @returns {void}
 */
export function markImageLoaded(src) {
  if (src) loadedImages.add(src)
}

/**
 * Whether the given image URL has already loaded during this session.
 * @param {string} src - the image URL
 * @returns {boolean}
 */
export function isImageLoaded(src) {
  return loadedImages.has(src)
}
