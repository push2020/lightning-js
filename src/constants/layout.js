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
