import Blits from '@lightningjs/blits'
import { startFpsMeter } from '../helpers/fpsMeter.js'

// Note: template values are hardcoded literals - see components/FocusBorder.js for why.
// 1920x1080 matches constants/layout.js STAGE_W/STAGE_H; 960/540 is stage center.

/**
 * Static test page: a plain background with no hero carousel, rails, or
 * images - none of the other pages' virtualization/scroll/image-decode
 * overhead. Shows a large, centered live FPS reading (sampled independently
 * via helpers/fpsMeter.js, same source as the small PerfHud corner overlay)
 * so the TV's actual rendering FPS is easy to read from a couch-distance screen.
 */
export default Blits.Component('FpsTest', {
  template: `
    <Element w="1920" h="1080" color="#0B0B0B">
      <Text x="64" y="64" content="FPS Test" size="48" color="#FFFFFF" />
      <Text x="64" y="124" content="Static page - no rails, carousels, or images." size="24" color="#AAAAAA" />
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
