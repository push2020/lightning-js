import Blits from '@lightningjs/blits'
import { DURATION, EASING, transition } from '../helpers/animations.js'
import FocusBorder from './FocusBorder.js'
import SkeletonCard from './SkeletonCard.js'

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// Poster image area is a fixed 260x300, with a 90px title/genre strip below
// (260x390 total card), matching constants/layout.js CARD_W/CARD_H.

/**
 * A single OTT poster card: image, title and genre, with a premium focus
 * animation (scale, glow, border, shadow, bring-to-front). Purely prop-driven -
 * the parent rail owns real keyboard focus and tells this card when it is selected.
 */
export default Blits.Component('PosterCard', {
  components: {
    FocusBorder,
    SkeletonCard,
  },
  template: `
    <Element :w="$w" :h="$h" :zIndex="$focused ? 10 : 1">
      <Element
        :w="$w"
        :h="$h"
        pivot="0.5"
        :scale.transition="$scaleTransition"
        shadow="{blur: 24, spread: 2, color: 'rgba(0, 0, 0, 0.65)'}"
      >
        <Element
          :w="$w"
          h="300"
          :rounded="12"
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
        <SkeletonCard :show="!$imageLoaded" :w="$w" h="300" :radius="12" />
        <FocusBorder :active="$focused" :w="$w" h="300" :radius="12" />
        <Element y="314" :w="$w">
          <Text :content="$title" size="26" color="#FFFFFF" font="raleway" maxwidth="$w" maxlines="1" />
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
    /**
     * Transition config for the focus scale animation
     * @returns {object}
     */
    scaleTransition() {
      return transition(this.focused ? 1.12 : 1, { duration: DURATION.base, easing: EASING.bounce })
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
  },
})
