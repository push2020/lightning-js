import Blits from '@lightningjs/blits'

// Note: template values are hardcoded literals - Blits extracts `template` via
// static source parsing, so it cannot contain JS template-literal interpolation.
// 1920x1080 matches the stage size passed to Blits.Launch; 960/540 is stage center.

/**
 * Single page app: shows the TV's live rendering FPS, large and centered,
 * measured via a requestAnimationFrame loop sampled once per second.
 */
export default Blits.Component('Home', {
  template: `
    <Element w="1920" h="1080" color="#0B0B0B">
      <Text x="960" y="540" mount="0.5" :content="$fps + ' FPS'" size="160" color="#39FF14" />
    </Element>
  `,
  state() {
    return {
      /**
       * Frames rendered per second, sampled over a rolling 1s window
       * @type {number}
       */
      fps: 0,
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
     * Stops the FPS sampling loop
     * @returns {void}
     */
    destroy() {
      cancelAnimationFrame(this._rafId)
    },
  },
})
