import { NAVBAR_CONTENT_GAP } from '../constants/layout.js'

/**
 * Calculates the horizontal scroll offset needed to bring the focused card to
 * its slot in the rail window, peek pixels in from the left edge - the same
 * slot for every card, including the first, so the row always starts at its
 * usual position at rest. Only once you've scrolled past the first card does
 * the previous card's edge start peeking/cutting off at the rail's true left
 * edge (a "peek" carousel), instead of scrolling fully out of view. Pins
 * every card to that same slot, even the last one in the rail, so trailing
 * cards never bunch up against the right edge; any remaining space past the
 * last card is simply left blank.
 * @param {number} index - index of the currently focused card
 * @param {number} cardWidth - width of a single card in pixels
 * @param {number} gap - horizontal spacing between cards in pixels
 * @param {number} peek - pixels of the previous card left peeking at the rail's left edge
 * @returns {number} scroll offset in pixels
 */
export function getRailScrollOffset(index, cardWidth, gap, peek) {
  return index * (cardWidth + gap) - peek
}

/**
 * Calculates the vertical scroll offset for the page content stack, based on
 * which section (the hero, or a specific rail) currently has focus. Rails are
 * scrolled to sit just below the fixed navbar overlay - with a small gap - so
 * their title and card tops are never clipped or flush against the navbar.
 * @param {number} sectionIndex - 0 for the hero, 1+ for rails
 * @param {number} heroHeight - height of the hero section in pixels
 * @param {number} railHeight - height of a single rail section in pixels
 * @param {number} navbarHeight - height of the fixed navbar overlay in pixels
 * @returns {number} vertical offset in pixels
 */
export function getPageScrollOffset(sectionIndex, heroHeight, railHeight, navbarHeight) {
  if (sectionIndex === 0) return 0
  return heroHeight + (sectionIndex - 1) * railHeight - navbarHeight - NAVBAR_CONTENT_GAP
}
