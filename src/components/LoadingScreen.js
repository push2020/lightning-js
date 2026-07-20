import Blits from '@lightningjs/blits'
import Loader from './Loader.js'

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// 1920x1080 matches constants/layout.js STAGE_W/STAGE_H.

/**
 * Full-screen boot splash shown briefly while the app initializes, hidden
 * instantly (no animation) once `show` becomes false.
 */
export default Blits.Component('LoadingScreen', {
  components: {
    Loader,
  },
  template: `
    <Element :show="$show" w="1920" h="1080" color="#0B0B0B" z="1000">
      <Text content="JioTV+" size="64" color="#00B3FF" x="960" y="460" mount="0.5" />
      <Loader x="960" y="560" mount="{x: 0.5}" w="160" loaderColor="#00B3FF" />
    </Element>
  `,
  props: {
    show: false,
  },
})
