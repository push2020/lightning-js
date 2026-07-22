import Blits from '@lightningjs/blits'
import SkeletonCard from './SkeletonCard.js'

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// Card total size is w x h, with the image occupying the top imageH pixels
// and a title/genre strip filling the rest - matching constants/layout.js
// CARD_TYPES. `rounded` is applied to the poster image (and its skeleton) so
// the same card can render as a square-cornered poster, a lightly-rounded
// landscape thumbnail, or (when w === imageH and rounded === w/2) a circle.

/**
 * A single OTT poster card: image, title and genre. Purely prop-driven and
 * has no notion of focus - the parent rail owns real keyboard focus and
 * renders a single fixed focus border over whichever card slides into the
 * selected slot (see ContentRail.js). No animation.
 */
export default Blits.Component('PosterCard', {
  components: {
    SkeletonCard,
  },
  template: `
    <Element :w="$w" :h="$h">
      <Element
        :w="$w"
        :h="$imageH"
        color="#ffffff"
        :src="$image"
        fit="cover"
        :rounded="$rounded"
        @loaded="$onImageLoaded"
        @error="$onImageError"
      >
        <Element :show="$hasProgress" :y="$imageH - 6" :w="$w" h="6" color="rgba(255, 255, 255, 0.25)">
          <Element h="6" color="#00B3FF" :w="$w * $progressValue" />
        </Element>
      </Element>
      <SkeletonCard :show="!$imageLoaded" :w="$w" :h="$imageH" :rounded="$rounded" />
      <Element :y="$imageH + 14" :w="$w">
        <Text :content="$title" size="26" color="#FFFFFF" maxwidth="$w" maxlines="1" />
        <Text y="32" :content="$genre" size="20" color="#AAAAAA" maxwidth="$w" maxlines="1" />
      </Element>
    </Element>
  `,
  props: {
    title: '',
    genre: '',
    image: '',
    progress: undefined,
    w: 260,
    h: 390,
    imageH: 300,
    rounded: 0,
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
