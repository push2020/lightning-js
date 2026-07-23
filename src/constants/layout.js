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

export const HERO_HEIGHT = 880
