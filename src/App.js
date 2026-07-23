import Blits from '@lightningjs/blits'
import { startFpsMeter } from './helpers/fpsMeter.js'

/**
 * Single-page app: a plain background showing a large, centered live FPS
 * reading, sampled via helpers/fpsMeter.js.
 */
export default Blits.Application({
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
     * Starts the FPS sampling loop
     * @returns {void}
     */
    ready() {
      this._meter = startFpsMeter((sample) => {
        this.fps = sample.fps
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
