import Blits from '@lightningjs/blits'

const REFRESH_INTERVAL_MS = 250

// Note: template values are hardcoded literals - see FocusBorder.js for why.

/**
 * Fixed performance overlay pinned to the top-right of the screen. Shows the
 * current FPS, the target time budget for one frame (1000 / fps), and the
 * actual measured time the last frame took to complete.
 */
export default Blits.Component('PerfHud', {
  template: `
    <Element x="1690" y="14" w="216" h="98" color="rgba(0, 0, 0, 0.6)" rounded="8" z="500">
      <Text x="14" y="10" :content="'FPS: ' + $fps" size="20" color="#00B3FF" font="raleway" />
      <Text x="14" y="38" :content="'Frame: ' + $frameTime + ' ms'" size="20" color="#FFFFFF" font="lato" />
      <Text x="14" y="64" :content="'Work: ' + $workTime + ' ms'" size="20" color="#AAAAAA" font="lato" />
    </Element>
  `,
  state() {
    return {
      /**
       * Frames per second, reported periodically by the renderer
       * @type {number}
       */
      fps: 0,
      /**
       * Target time budget (in ms) to paint one frame at the current FPS
       * @type {string}
       */
      frameTime: '0.0',
      /**
       * Actual measured time (in ms) the last frame took to complete
       * @type {string}
       */
      workTime: '0.0',
      /**
       * Timestamp of the last time the work value was refreshed, used to
       * throttle updates so the HUD itself doesn't add render overhead
       * @type {number}
       */
      lastRefresh: 0,
    }
  },
  hooks: {
    /**
     * Updates the FPS reading and recalculates the target frame time budget
     * @param {number} fps - current frames per second reported by the renderer
     * @returns {void}
     */
    fpsUpdate(fps) {
      this.fps = fps
      this.frameTime = fps > 0 ? (1000 / fps).toFixed(1) : '0.0'
    },
    /**
     * Samples the actual per-frame delta on every render frame, throttled to
     * REFRESH_INTERVAL_MS so updating the HUD doesn't itself cost performance
     * @param {{time: number, delta: number}} data - frame timing info
     * @returns {void}
     */
    frameTick(data) {
      if (data.time - this.lastRefresh < REFRESH_INTERVAL_MS) return
      this.lastRefresh = data.time
      this.workTime = data.delta.toFixed(1)
    },
  },
})
