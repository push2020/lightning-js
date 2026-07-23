import Blits from '@lightningjs/blits'
import { startFpsMeter } from '../helpers/fpsMeter.js'

// Note: template values are hardcoded literals - Blits extracts `template` via
// static source parsing, so it cannot contain JS template-literal interpolation.
// 1920x1080 matches the stage size passed to Blits.Launch; 960/540 is stage center.

/**
 * Single page app: shows the TV's live rendering FPS, large and centered,
 * sampled independently via helpers/fpsMeter.js.
 */
export default Blits.Component('Home', {
  template: `
    <Element w="1920" h="1080" color="#0B0B0B">
      <Text x="960" y="540" mount="0.5" :content="$fps + ' FPS'" size="160" color="#00B3FF" />
    </Element>
  `,
  state() {
    return {
      /**
       * Frames rendered per second, sampled over a rolling window
       * @type {number}
       */
      fps: 0,
    }
  },
  hooks: {
    /**
     * Starts the shared FPS sampling loop
     * @returns {void}
     */
    ready() {
      this._meter = startFpsMeter((fps) => {
        this.fps = fps
      })
    },
    /**
     * Stops the FPS sampling loop
     * @returns {void}
     */
    destroy() {
      this._meter.stop()
    },
  },
})
