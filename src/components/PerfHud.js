import Blits from '@lightningjs/blits'

// How often the displayed FPS/Frame/Work numbers refresh (ms)
const FLUSH_MS = 250

// Note: template values are hardcoded literals - see FocusBorder.js for why.

/**
 * Rounds a number to one decimal place.
 * @param {number} value - the number to round
 * @returns {number} value rounded to 1 decimal place
 */
function round1(value) {
  return Math.round(value * 10) / 10
}

/**
 * Fixed performance overlay pinned to the top-right of the screen. Runs its
 * own requestAnimationFrame loop (independent of Blits' internal render loop)
 * to measure three numbers over a rolling FLUSH_MS window:
 *  - FPS: frames actually rendered per second in that window.
 *  - Frame: average wall-clock time per frame (ms), including any idle time
 *    spent waiting for vsync.
 *  - Work: average main-thread busy time per frame (ms) - script + layout +
 *    paint - approximated with the "post a task at frame start" trick: a
 *    MessageChannel message posted at the start of the rAF callback is only
 *    delivered after the browser finishes that frame's rendering work, so
 *    (deliveredAt - frameStart) is roughly the busy time.
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
       * Frames rendered per second, measured over the last FLUSH_MS window
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
     * Starts an independent requestAnimationFrame sampling loop. Bookkeeping
     * (frame counts, timestamps) is kept in local closures rather than Blits
     * state, since it changes every frame and none of it needs to be reactive
     * or trigger a re-render itself - only the flushed fps/frameTime/workTime
     * values do.
     * @returns {void}
     */
    ready() {
      let frames = 0
      let workSum = 0
      let windowStart = performance.now()
      let frameStart = 0
      let lastWork = 0

      const channel = new MessageChannel()
      channel.port1.onmessage = () => {
        lastWork = performance.now() - frameStart
      }

      const tick = (now) => {
        frameStart = now
        frames += 1
        workSum += lastWork

        const elapsed = now - windowStart
        if (elapsed >= FLUSH_MS) {
          this.fps = Math.round((frames * 1000) / elapsed)
          this.frameTime = round1(elapsed / frames).toFixed(1)
          this.workTime = round1(workSum / frames).toFixed(1)
          frames = 0
          workSum = 0
          windowStart = now
        }

        // Measure when this frame's main-thread work actually ends.
        channel.port2.postMessage(null)
        this._rafId = requestAnimationFrame(tick)
      }

      this._channel = channel
      this._rafId = requestAnimationFrame(tick)
    },
    /**
     * Stops the requestAnimationFrame loop and releases the MessageChannel
     * @returns {void}
     */
    destroy() {
      cancelAnimationFrame(this._rafId)
      this._channel.port1.onmessage = null
    },
  },
})
