import Blits from '@lightningjs/blits'
import { DURATION } from '../helpers/animations.js'
import Loader from './Loader.js'

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// 1920x1080 matches constants/layout.js STAGE_W/STAGE_H.

/**
 * Full-screen boot splash shown briefly while the app initializes, fading
 * out once `show` becomes false and unmounting shortly after.
 */
export default Blits.Component('LoadingScreen', {
  components: {
    Loader,
  },
  template: `
    <Element :show="$visible" w="1920" h="1080" color="#0B0B0B" z="1000" :alpha.transition="{value: $show ? 1 : 0, duration: 500}">
      <Text content="JioTV+" size="64" font="raleway" color="#00B3FF" x="960" y="460" mount="0.5" />
      <Loader x="960" y="560" mount="{x: 0.5}" w="160" loaderColor="#00B3FF" />
    </Element>
  `,
  props: {
    show: false,
  },
  state() {
    return {
      /**
       * Whether the loading screen is still mounted (kept briefly after fading out)
       * @type {boolean}
       */
      visible: true,
    }
  },
  watch: {
    /**
     * Unmounts the loading screen shortly after it finishes fading out
     * @param {boolean} value - new value of the show prop
     * @returns {void}
     */
    show(value) {
      if (value) {
        this.visible = true
        return
      }
      this.$setTimeout(() => {
        this.visible = false
      }, DURATION.slow)
    },
  },
})
