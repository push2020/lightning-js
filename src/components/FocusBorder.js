import Blits from '@lightningjs/blits'

// Note: Blits extracts the `template` string via static source parsing, so it
// cannot contain JS template-literal interpolation (${...}) - values here are
// intentionally hardcoded literals (kept in sync with constants/theme.js and
// constants/layout.js by convention).

/**
 * Decorative focus indicator overlaid on top of a card: a soft accent-colored
 * glow plus a crisp white border, both fading in/out as `active` toggles.
 */
export default Blits.Component('FocusBorder', {
  template: `
    <Element>
      <Element
        x="-6"
        y="-6"
        :w="$w + 12"
        :h="$h + 12"
        :rounded="$radius + 6"
        color="rgba(0, 179, 255, 0.25)"
        :alpha.transition="{value: $active ? 0.8 : 0, duration: 300}"
      />
      <Element
        :w="$w"
        :h="$h"
        :rounded="$radius"
        :border="{width: 2, color: '#FFFFFF'}"
        :alpha.transition="{value: $active ? 1 : 0, duration: 200}"
      />
    </Element>
  `,
  props: {
    active: false,
    w: 260,
    h: 390,
    radius: 12,
  },
})
