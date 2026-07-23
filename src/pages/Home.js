import Blits from '@lightningjs/blits'

// Note: template values are hardcoded literals - Blits extracts `template` via
// static source parsing, so it cannot contain JS template-literal interpolation.
// 1920x1080 matches the stage size passed to Blits.Launch; 960/540 is stage center.

/**
 * Single page app: shows the TV's live rendering FPS side by side, large and
 * centered, measured two ways - via a requestAnimationFrame loop sampled
 * once per second, and via Blits' own built-in fpsUpdate hook.
 */
export default Blits.Component('Home', {
  template: `
    <Element w="1920" h="1080" color="#0B0B0B">
      <Text x="480" y="500" mount="0.5" :content="$fps + ' FPS'" size="120" color="#ff7e14" />
      <Text x="480" y="620" mount="0.5" content="using RAF" size="36" color="#888888" />
    
      <Text x="1440" y="500" mount="0.5" :content="$blitsFps + ' FPS'" size="120" color="#ff1495" />
      <Text x="1440" y="620" mount="0.5" content="using Blits" size="36" color="#888888" />
    </Element>
  `,
  state() {
    return {
      /**
       * Frames rendered per second, sampled over a rolling 1s window via
       * our own requestAnimationFrame loop
       * @type {number}
       */
      fps: 0,
      /**
       * Frames rendered per second, as reported by Blits' own renderer
       * @type {number}
       */
      blitsFps: 0,
    }
  },
  hooks: {
    /**
     * Starts a requestAnimationFrame loop that counts frames and updates
     * fps once per second.
     * @returns {void}
     */
    ready() {
      let frames = 0
      let lastTime = performance.now()

      const loop = (now) => {
        frames++

        if (now - lastTime >= 1000) {
          this.fps = Math.round((frames * 1000) / (now - lastTime))
          frames = 0
          lastTime = now
        }

        this._rafId = requestAnimationFrame(loop)
      }

      this._rafId = requestAnimationFrame(loop)
    },
    /**
     * Blits' built-in FPS hook, fired at the renderer's own fpsInterval
     * @param {number} fps - fps value reported by the Blits renderer
     * @returns {void}
     */
    fpsUpdate(fps) {
      this.blitsFps = fps
    },
    /**
     * Stops the FPS sampling loop
     * @returns {void}
     */
    destroy() {
      cancelAnimationFrame(this._rafId)
    },
  },
})
