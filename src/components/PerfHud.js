import Blits from '@lightningjs/blits'
import { startFpsMeter } from '../helpers/fpsMeter.js'

// Note: template values are hardcoded literals - see FocusBorder.js for why.

/**
 * Fixed performance overlay pinned to the top-right of the screen, showing
 * live FPS / frame time / main-thread work time sampled by helpers/fpsMeter.js.
 */
export default Blits.Component('PerfHud', {
  template: `
    <Element x="1690" y="14" w="216" h="98" color="rgba(0, 0, 0, 0.6)" rounded="8" z="500">
      <Text x="14" y="10" :content="'FPS: ' + $fps" size="20" color="#00B3FF" />
      <Text x="14" y="38" :content="'Frame: ' + $frameTime + ' ms'" size="20" color="#FFFFFF" />
      <Text x="14" y="64" :content="'Work: ' + $workTime + ' ms'" size="20" color="#AAAAAA" />
    </Element>
  `,
  state() {
    return {
      /**
       * Frames rendered per second, measured over the last sampling window
       * @type {number}
       */
      fps: 0,
      /**
       * Average wall-clock time per frame (ms) over the last window
       * @type {string}
       */
      frameTime: '0.0',
      /**
       * Average main-thread busy time per frame (ms) over the last window
       * @type {string}
       */
      workTime: '0.0',
    }
  },
  hooks: {
    /**
     * Starts the shared FPS sampling loop
     * @returns {void}
     */
    ready() {
      this._meter = startFpsMeter((sample) => {
        this.fps = sample.fps
        this.frameTime = sample.frameTime
        this.workTime = sample.workTime
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
