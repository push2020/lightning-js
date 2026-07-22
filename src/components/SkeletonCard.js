import Blits from '@lightningjs/blits'

// Note: template values are hardcoded literals - see FocusBorder.js for why.

/**
 * Placeholder block shown in place of a poster image while it is still loading.
 * Takes the same `rounded` corner radius as the poster image it stands in
 * for, so a circular/landscape card's skeleton matches its final shape.
 */
export default Blits.Component('SkeletonCard', {
  template: `
    <Element :w="$w" :h="$h" color="#1C1C1C" :rounded="$rounded">
      <Element x="16" y="16" :w="$w - 32" h="10" color="#2A2A2A" />
      <Element x="16" y="40" :w="$w - 90" h="10" color="#2A2A2A" />
    </Element>
  `,
  props: {
    w: 260,
    h: 300,
    rounded: 0,
  },
})
