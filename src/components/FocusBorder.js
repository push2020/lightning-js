import Blits from '@lightningjs/blits'

// Note: Blits extracts the `template` string via static source parsing, so it
// cannot contain JS template-literal interpolation (${...}) - values here are
// intentionally hardcoded literals (kept in sync with constants/theme.js by convention).

/**
 * Decorative focus indicator overlaid on top of a card: a plain flat border,
 * shown when `active` is true. No transition/animation. The border is drawn
 * outset from the card by 8px on every side (x/y/w/h below), so it never
 * touches the card artwork.
 */
export default Blits.Component('FocusBorder', {
  template: `
    <Element
      x="-8"
      y="-8"
      :w="$w + 16"
      :h="$h + 16"
      :show="$active"
      :border="{w: 4, color: '#ffffff'}"
    />
  `,
  props: {
    active: false,
    w: 260,
    h: 390,
  },
})
