import Blits from '@lightningjs/blits'

/**
 * Static three-dot loading indicator. No animation.
 */
export default Blits.Component('Loader', {
  template: `
    <Element>
      <Circle size="40" :color="$loaderColor || '#94a3b8'" />
      <Circle size="40" :color="$loaderColor || '#94a3b8'" x="60" />
      <Circle size="40" :color="$loaderColor || '#94a3b8'" x="120" />
    </Element>
    `,
  props: {
    loaderColor: undefined,
  },
})
