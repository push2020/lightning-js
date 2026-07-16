import Blits from '@lightningjs/blits'
import { DURATION } from '../helpers/animations.js'
import { playFocusSound, playSelectSound } from '../helpers/focusSound.js'
import HeroSlide from './HeroSlide.js'

const AUTOPLAY_INTERVAL = 5000
const CTA_BOUNCE_SCALE = 0.94

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// 1920x880 matches constants/layout.js STAGE_W/HERO_HEIGHT, x="64" matches
// CONTENT_PADDING_X, dot spacing of 22px is a fixed visual constant.
// CTA y="762" and dots y="850" are positioned to clear the copy block in
// HeroSlide.js (which reserves room for a full 2-line description) - if that
// copy block's vertical layout changes, these need to move together with it.

/**
 * Full-width auto-playing hero banner. Owns real keyboard focus: Left/Right
 * manually change slides (and restart autoplay), Enter triggers the Watch Now
 * feedback animation. Pagination dots reflect the active slide.
 */
export default Blits.Component('HeroCarousel', {
  components: {
    HeroSlide,
  },
  template: `
    <Element w="1920" h="880">
      <HeroSlide
        :for="(slide, index) in $slides"
        key="$slide.id"
        :image="$slide.image"
        :title="$slide.title"
        :subtitle="$slide.subtitle"
        :description="$slide.description"
        :active="$index === $currentIndex"
      />
      <Element
        x="64"
        y="762"
        w="280"
        h="72"
        :rounded="8"
        :color="$$hasFocus ? '#00B3FF' : 'rgba(255, 255, 255, 0.12)'"
        :border="{width: 2, color: '#FFFFFF'}"
        :scale.transition="{value: $ctaScale, duration: 200}"
      >
        <Text content="Watch Now" size="28" color="#FFFFFF" font="raleway" x="30" y="20" />
      </Element>
      <Element x="64" y="850">
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
       * Scale applied to the CTA button, used for the Enter key bounce feedback
       * @type {number}
       */
      ctaScale: 1,
      /**
       * Interval id for the autoplay rotation, so it can be cleared and restarted
       * @type {number|null}
       */
      autoplayId: null,
    }
  },
  hooks: {
    /**
     * Starts the autoplay rotation once the carousel is mounted
     * @returns {void}
     */
    ready() {
      this.startAutoplay()
    },
  },
  input: {
    /**
     * Manually shows the previous hero slide and restarts autoplay
     * @returns {void}
     */
    left() {
      const previous = this.currentIndex === 0 ? this.slides.length - 1 : this.currentIndex - 1
      this.goToSlide(previous)
    },
    /**
     * Manually shows the next hero slide and restarts autoplay
     * @returns {void}
     */
    right() {
      const next = this.currentIndex === this.slides.length - 1 ? 0 : this.currentIndex + 1
      this.goToSlide(next)
    },
    /**
     * Triggers the Watch Now CTA bounce feedback
     * @returns {void}
     */
    enter() {
      playSelectSound()
      this.ctaScale = CTA_BOUNCE_SCALE
      this.$setTimeout(() => {
        this.ctaScale = 1
      }, DURATION.fast)
    },
  },
  methods: {
    /**
     * Advances to the given slide index and restarts the autoplay timer
     * @param {number} index - target slide index
     * @returns {void}
     */
    goToSlide(index) {
      this.currentIndex = index
      playFocusSound()
      this.startAutoplay()
    },
    /**
     * (Re)starts the autoplay interval that advances the hero slide every 5 seconds
     * @returns {void}
     */
    startAutoplay() {
      if (this.autoplayId) this.$clearInterval(this.autoplayId)
      this.autoplayId = this.$setInterval(() => {
        this.currentIndex = this.currentIndex === this.slides.length - 1 ? 0 : this.currentIndex + 1
      }, AUTOPLAY_INTERVAL)
    },
  },
})
