/**
 * Calculates the horizontal scroll offset needed to bring the focused card to
 * the first (leftmost) visible position in the rail window. Always pins the
 * focused card to the start - even the last card in the rail - so trailing
 * cards never stay bunched up against the right edge; any remaining space
 * to the right of the last card is simply left blank.
 * @param {number} index - index of the currently focused card
 * @param {number} cardWidth - width of a single card in pixels
 * @param {number} gap - horizontal spacing between cards in pixels
 * @returns {number} scroll offset in pixels
 */
export function getRailScrollOffset(index, cardWidth, gap) {
  return Math.max(index * (cardWidth + gap), 0)
}

// Extra breathing room kept between the fixed navbar overlay and a scrolled-to
// rail's title, so the title never sits flush against (or under) the navbar.
const NAVBAR_GAP = 24

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
  return heroHeight + (sectionIndex - 1) * railHeight - navbarHeight - NAVBAR_GAP
}
