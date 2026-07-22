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

export const RAIL_TITLE_HEIGHT = 76
export const RAIL_GAP = 40
export const RAIL_HEIGHT = RAIL_TITLE_HEIGHT + CARD_H + RAIL_GAP

export const HERO_HEIGHT = 880

export const RAIL_VISIBLE_WIDTH = STAGE_W - CONTENT_PADDING_X * 2

/**
 * Per-shape card dimensions. Rails cycle through these (see CARD_TYPE_ORDER)
 * so consecutive rails alternate portrait / landscape / circular presentation
 * of the same underlying item data. `gap` is the horizontal spacing after
 * this card type, and `rounded` is the corner radius applied to the poster
 * image (half of `imageH`/`w` for circular, so a square image renders as a
 * perfect circle - see components/PosterCard.js).
 */
export const CARD_TYPES = {
  portrait: { w: 260, h: 390, imageH: 300, gap: 28, rounded: 0 },
  landscape: { w: 460, h: 320, imageH: 259, gap: 32, rounded: 12 },
  circular: { w: 200, h: 280, imageH: 200, gap: 40, rounded: 100 },
}

/**
 * Order in which rails cycle through card shapes: 1st rail portrait, 2nd
 * landscape, 3rd circular, then repeats.
 */
export const CARD_TYPE_ORDER = ['portrait', 'landscape', 'circular']

/**
 * Looks up the dimension config for a card type, falling back to portrait
 * for an unknown/missing type.
 * @param {string} type - one of the CARD_TYPES keys
 * @returns {typeof CARD_TYPES['portrait']} the card type's dimension config
 */
export function getCardConfig(type) {
  return CARD_TYPES[type] || CARD_TYPES.portrait
}
