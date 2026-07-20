import Blits from '@lightningjs/blits'
import { playFocusSound, playSelectSound } from '../helpers/focusSound.js'
import HeroSlide from './HeroSlide.js'

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// 1920x880 matches constants/layout.js STAGE_W/HERO_HEIGHT, x="64" matches
// CONTENT_PADDING_X, dot spacing of 22px is a fixed visual constant.
// CTA y="762" and dots y="850" are positioned to clear the copy block in
// HeroSlide.js (which reserves room for a full 2-line description) - if that
// copy block's vertical layout changes, these need to move together with it.

/**
 * Full-width hero banner. Owns real keyboard focus: Left/Right manually
 * change slides, Enter confirms the Watch Now action. Pagination dots
 * reflect the active slide. No animation, no autoplay.
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
      >
        <Text content="Watch Now" size="28" color="#FFFFFF" x="30" y="20" />
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
    }
  },
  input: {
    /**
     * Manually shows the previous hero slide
     * @returns {void}
     */
    left() {
      const previous = this.currentIndex === 0 ? this.slides.length - 1 : this.currentIndex - 1
      this.goToSlide(previous)
    },
    /**
     * Manually shows the next hero slide
     * @returns {void}
     */
    right() {
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
     * Advances to the given slide index
     * @param {number} index - target slide index
     * @returns {void}
     */
    goToSlide(index) {
      this.currentIndex = index
      playFocusSound()
    },
  },
})
