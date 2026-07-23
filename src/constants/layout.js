/**
 * Fixed pixel budget for the 1920x1080 design resolution. Blits automatically
 * scales these values to match the device's actual screen resolution.
 */
export const STAGE_W = 1920
export const STAGE_H = 1080

export const NAVBAR_HEIGHT = 130

export const CONTENT_PADDING_X = 64

export const CARD_W = 260
export const CARD_H = 390
export const CARD_GAP = 28

// Height of the title/genre text strip below a card's image (both portrait
// and landscape cards share this strip height - only the image area above it
// changes size). 390 - 300 = 90 for the portrait default.
export const CARD_TEXT_STRIP_HEIGHT = 90

// Landscape (16:9 thumbnail) card variant, used for rows like "Continue
// Watching" instead of the tall portrait poster. Same text strip height as
// the portrait card, so only the image area is wider/shorter.
export const LANDSCAPE_CARD_W = 460
export const LANDSCAPE_IMAGE_H = 259
export const LANDSCAPE_CARD_H = LANDSCAPE_IMAGE_H + CARD_TEXT_STRIP_HEIGHT

// Peek carousel: how far the focused card's slot sits from the rail's left
// edge (matching CONTENT_PADDING_X, so it lines up with the rail title and
// the rest of the app's content margin, and the first card always rests at
// its usual position). Once scrolled past the first card, the previous
// card's edge peeks/cuts off at the rail's true left edge instead of
// scrolling fully out of view - see ContentRail.js.
export const CARD_PEEK_WIDTH = 64

export const RAIL_TITLE_HEIGHT = 76
export const RAIL_GAP = 40
export const RAIL_HEIGHT = RAIL_TITLE_HEIGHT + CARD_H + RAIL_GAP

/** Vertical gap between the navbar and a focused rail's title (see scroll.js). */
export const NAVBAR_CONTENT_GAP = 24

/** Offset from the rail block top to the card track (see ContentRail.js). */
export const RAIL_TRACK_OFFSET_Y = 52

/** Fixed height of the card track box inside a rail (see ContentRail.js). */
export const RAIL_TRACK_H = 438

/** FocusBorder draws outset from the card edge on every side (see FocusBorder.js). */
export const FOCUS_BORDER_OUTSET = 8

/**
 * Vertical offset of a card within the rail's fixed-height track box.
 * @param {number} cardH - card height in pixels
 * @returns {number}
 */
export function getCardYInRailTrack(cardH) {
  return Math.round((RAIL_TRACK_H - cardH) / 2)
}

/**
 * Screen-space Y for the rail focus border when a rail is scrolled into the
 * focus slot below the navbar (Prime-style fixed frame).
 * @param {number} cardH - card height in pixels
 * @param {number} [navbarHeight=NAVBAR_HEIGHT]
 * @returns {number}
 */
export function getRailFocusBorderScreenY(cardH, navbarHeight = NAVBAR_HEIGHT) {
  const railTop = navbarHeight + NAVBAR_CONTENT_GAP
  return railTop + RAIL_TRACK_OFFSET_Y + getCardYInRailTrack(cardH) - FOCUS_BORDER_OUTSET
}

export const HERO_HEIGHT = 880
