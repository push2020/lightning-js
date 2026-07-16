import Blits from '@lightningjs/blits'

// Note: Blits extracts the `template` string via static source parsing, so it
// cannot contain JS template-literal interpolation (${...}) - values here are
// intentionally hardcoded literals (kept in sync with constants/theme.js by convention).

// Matches the flat, square-cornered focus frame from the reference Rust/WebGL
// renderer (github.com/Faizranas/rust, Stage::draw_frame): a plain border
// rectangle, no rounding, no glow/blur.

/**
 * Decorative focus indicator overlaid on top of a card: a plain flat border,
 * fading in/out as `active` toggles.
 */
export default Blits.Component('FocusBorder', {
  template: `
    <Element
      :w="$w"
      :h="$h"
      :border="{width: 4, color: '#00B3FF'}"
      :alpha.transition="{value: $active ? 1 : 0, duration: 150}"
    />
  `,
  props: {
    active: false,
    w: 260,
    h: 390,
  },
})
