import Blits from '@lightningjs/blits'
import FocusBorder from './FocusBorder.js'
import SkeletonCard from './SkeletonCard.js'

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// Poster image area is a fixed 260x300, with a 90px title/genre strip below
// (260x390 total card), matching constants/layout.js CARD_W/CARD_H.

// Focus-scale animation, ported from a Rust/WebGL reference renderer's card
// animation (github.com/Faizranas/rust): instead of a fixed-duration CSS-style
// transition, the scale eases toward its target by covering a fraction of the
// remaining distance every frame - frame-rate independent, naturally ease-out.
// On gaining focus the scale is first snapped back to 1, so it visibly "pops"
// up to FOCUS_SCALE on every move rather than cross-fading smoothly.
const FOCUS_SCALE = 1.1
const SCALE_TAU_MS = 90
const SCALE_SETTLE_EPSILON = 0.001

/**
 * Rounds the remaining gap between a value and its target for one animation
 * frame using exponential smoothing (frame-rate independent ease-out).
 * @param {number} value - current animated value
 * @param {number} target - value being eased toward
 * @param {number} dt - milliseconds elapsed since the previous frame
 * @returns {number} the new eased value
 */
function ease(value, target, dt) {
  const k = 1 - Math.exp(-dt / SCALE_TAU_MS)
  return value + (target - value) * k
}

/**
 * A single OTT poster card: image, title and genre, with a flat focus
 * animation (scale, border, bring-to-front - no rounding/shadow/glow, matching
 * the reference Rust/WebGL renderer's card style). Purely prop-driven - the
 * parent rail owns real keyboard focus and tells this card when it is selected.
 */
export default Blits.Component('PosterCard', {
  components: {
    FocusBorder,
    SkeletonCard,
  },
  template: `
    <Element :w="$w" :h="$h" :zIndex="$focused ? 10 : 1">
      <Element :w="$w" :h="$h" pivot="0.5" :scale="$scale">
        <Element
          :w="$w"
          h="300"
          color="#ffffff"
          :src="$image"
          fit="cover"
          @loaded="$onImageLoaded"
          @error="$onImageError"
        >
          <Element :show="$hasProgress" y="294" :w="$w" h="6" color="rgba(255, 255, 255, 0.25)">
            <Element h="6" color="#00B3FF" :w="$w * $progressValue" />
          </Element>
        </Element>
        <SkeletonCard :show="!$imageLoaded" :w="$w" h="300" />
        <FocusBorder :active="$focused" :w="$w" h="300" />
        <Element y="314" :w="$w">
          <Text :content="$title" size="26" color="#FFFFFF" maxwidth="$w" maxlines="1" />
          <Text y="32" :content="$genre" size="20" color="#AAAAAA" maxwidth="$w" maxlines="1" />
        </Element>
      </Element>
    </Element>
  `,
  props: {
    title: '',
    genre: '',
    image: '',
    progress: undefined,
    focused: false,
    w: 260,
    h: 390,
  },
  state() {
    return {
      /**
       * Whether the poster image has finished loading
       * @type {boolean}
       */
      imageLoaded: false,
      /**
       * Current animated scale of the card, eased manually frame-by-frame
       * toward 1 (unfocused) or FOCUS_SCALE (focused) instead of using a
       * fixed-duration transition
       * @type {number}
       */
      scale: 1,
    }
  },
  computed: {
    /**
     * Whether this card should display a continue-watching progress bar
     * @returns {boolean}
     */
    hasProgress() {
      return typeof this.progress === 'number'
    },
    /**
     * Normalized progress value clamped between 0 and 1
     * @returns {number}
     */
    progressValue() {
      if (typeof this.progress !== 'number') return 0
      return Math.min(Math.max(this.progress, 0), 1)
    },
  },
  watch: {
    /**
     * On gaining focus, pops the scale back to 1 first (so every focus change
     * animates from the same starting point) then (re)starts the per-frame
     * easing loop toward the new target. The loop is only ever running while
     * a card is actually mid-animation - not continuously for every card -
     * so idle cards cost nothing per frame.
     * @param {boolean} focused - new focused value
     * @returns {void}
     */
    focused(focused) {
      if (focused) this.scale = 1
      this.startScaleAnimation()
    },
  },
  hooks: {
    /**
     * Binds the animation step once per instance, so it can be passed directly
     * to requestAnimationFrame without losing its `this` context
     * @returns {void}
     */
    ready() {
      this._stepScaleAnimation = this.stepScaleAnimation.bind(this)
    },
    /**
     * Cancels any in-flight scale animation loop if the card is destroyed mid-transition
     * @returns {void}
     */
    destroy() {
      this.stopScaleAnimation()
    },
  },
  methods: {
    /**
     * Reveals the poster image and hides the skeleton placeholder once loaded
     * @returns {void}
     */
    onImageLoaded() {
      this.imageLoaded = true
    },
    /**
     * Keeps the skeleton placeholder visible when the poster image fails to load
     * @returns {void}
     */
    onImageError() {
      this.imageLoaded = false
    },
    /**
     * Starts the per-frame scale-easing loop, unless one is already running
     * @returns {void}
     */
    startScaleAnimation() {
      if (this._rafId) return
      this._lastFrameTime = performance.now()
      this._rafId = requestAnimationFrame(this._stepScaleAnimation)
    },
    /**
     * Stops the per-frame scale-easing loop, if one is running
     * @returns {void}
     */
    stopScaleAnimation() {
      if (this._rafId) cancelAnimationFrame(this._rafId)
      this._rafId = null
    },
    /**
     * One iteration of the scale-easing loop: advances the scale toward its
     * target, snapping and stopping once close enough to avoid animating forever
     * @param {number} now - timestamp supplied by requestAnimationFrame
     * @returns {void}
     */
    stepScaleAnimation(now) {
      const dt = now - this._lastFrameTime
      this._lastFrameTime = now
      const target = this.focused ? FOCUS_SCALE : 1

      this.scale = ease(this.scale, target, dt)

      if (Math.abs(target - this.scale) < SCALE_SETTLE_EPSILON) {
        this.scale = target
        this._rafId = null
        return
      }
      this._rafId = requestAnimationFrame(this._stepScaleAnimation)
    },
  },
})
