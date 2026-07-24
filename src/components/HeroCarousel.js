import Blits from '@lightningjs/blits'
import { playFocusSound, playSelectSound } from '../helpers/focusSound.js'
import { getTierConfig } from '../helpers/deviceTier.js'
import {
  SCROLL_TRANSITION_DURATION,
  SCROLL_TRANSITION_EASING,
  HERO_SCROLL,
} from '../constants/animation.js'
import HeroSlide from './HeroSlide.js'

const { heroNeighbors: HERO_NEIGHBORS } = getTierConfig().window

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// 1920x880 matches constants/layout.js STAGE_W/HERO_HEIGHT, x="64" matches
// CONTENT_PADDING_X, dot spacing of 22px is a fixed visual constant.
// CTA y="762" and dots y="850" are positioned to clear the copy block in
// HeroSlide.js (which reserves room for a full 2-line description) - if that
// copy block's vertical layout changes, these need to move together with it.
// The CTA and dots need zIndex="1": siblings are stacked by creation order,
// not template order, and the :range window mounts new HeroSlide instances
// on demand as slides are paged to - each of those mounts after the CTA/dots
// already exist, which would otherwise render on top of them.

/**
 * Full-width hero banner. Owns real keyboard focus: Left/Right manually
 * change slides, Enter confirms the Watch Now action. Pagination dots
 * reflect the active slide. Slides crossfade on change; no autoplay.
 */
export default Blits.Component('HeroCarousel', {
  components: {
    HeroSlide,
  },
  template: `
    <Element w="1920" h="880">
      <HeroSlide
        :for="(slide, index) in $slides"
        :range="{from: $slideWinStart, to: $slideWinEnd}"
        key="$slide.id"
        :image="$slide.image"
        :title="$slide.title"
        :subtitle="$slide.subtitle"
        :description="$slide.description"
        :active="$index === $currentIndex"
        :fadeDuration="$fadeDuration"
        :fadeEasing="$fadeEasing"
      />
      <Element
        x="64"
        y="762"
        w="280"
        h="72"
        zIndex="1"
        :rounded="8"
        :color="$$hasFocus ? '#00B3FF' : 'rgba(255, 255, 255, 0.12)'"
        :border="{width: 2, color: '#FFFFFF'}"
      >
        <Text content="Watch Now" size="28" color="#FFFFFF" x="30" y="20" />
      </Element>
      <Element x="64" y="850" zIndex="1">
        <Element
          :for="(slide, index) in $slides"
          key="$slide.id"
          :x="$index * 22"
          w="14"
          h="14"
          :rounded="7"
          :color="$index === $currentIndex ? '#00B3FF' : 'rgba(255, 255, 255, 0.35)'"
          :scale="$index === $currentIndex ? 1.2 : 1"
        />
      </Element>
    </Element>
  `,
  props: {
    slides: [],
  },
  state() {
    return {
      /**
       * Index of the currently displayed hero slide
       * @type {number}
       */
      currentIndex: 0,
      /**
       * Index of the first hero slide mounted by the :range virtualization window
       * @type {number}
       */
      slideWinStart: 0,
      /**
       * Index one past the last hero slide mounted by the :range virtualization window
       * @type {number}
       */
      slideWinEnd: HERO_NEIGHBORS + 1,
      /**
       * Duration (ms) of the current slide crossfade. Shortened while Left/Right
       * is held so held paging stays clean; restored to the full settle fade for
       * a single, deliberate press.
       * @type {number}
       */
      fadeDuration: SCROLL_TRANSITION_DURATION,
      /**
       * Easing of the current slide crossfade; near-linear while holding.
       * @type {string}
       */
      fadeEasing: SCROLL_TRANSITION_EASING,
    }
  },
  input: {
    /**
     * Manually shows the previous hero slide
     * @returns {void}
     */
    left() {
      if (!this.gateScrollStep()) return
      const previous = this.currentIndex === 0 ? this.slides.length - 1 : this.currentIndex - 1
      this.goToSlide(previous)
    },
    /**
     * Manually shows the next hero slide
     * @returns {void}
     */
    right() {
      if (!this.gateScrollStep()) return
      const next = this.currentIndex === this.slides.length - 1 ? 0 : this.currentIndex + 1
      this.goToSlide(next)
    },
    /**
     * Confirms the Watch Now action
     * @returns {void}
     */
    enter() {
      playSelectSound()
    },
  },
  methods: {
    /**
     * Rate-limits held-key auto-repeat and picks the crossfade speed. Drops
     * repeats arriving faster than throttleMs so held paging doesn't flicker
     * through slides; when a step is accepted, uses the short fade for held
     * paging and the full settle fade for a single press.
     * @returns {boolean} true if the caller should proceed with the step
     */
    gateScrollStep() {
      const cfg = HERO_SCROLL
      const now = performance.now()
      const dt = now - (this._lastNavAt ?? -Infinity)
      if (dt < cfg.throttleMs) return false
      const fast = dt < cfg.fastWindowMs
      this.fadeDuration = fast ? cfg.fastDuration : cfg.settleDuration
      this.fadeEasing = fast ? cfg.fastEasing : cfg.settleEasing
      this._lastNavAt = now
      return true
    },
    /**
     * Advances to the given slide index, sliding the mount window so only
     * the active slide and its immediate neighbors are instantiated
     * @param {number} index - target slide index
     * @returns {void}
     */
    goToSlide(index) {
      this.currentIndex = index
      this.slideWinStart = Math.max(0, index - HERO_NEIGHBORS)
      this.slideWinEnd = index + HERO_NEIGHBORS + 1
      playFocusSound()
    },
  },
})
