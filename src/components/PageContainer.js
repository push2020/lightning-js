import Blits from '@lightningjs/blits'
import { HERO_HEIGHT, RAIL_HEIGHT, NAVBAR_HEIGHT } from '../constants/layout.js'
import { DURATION, EASING, transition } from '../helpers/animations.js'
import { getPageScrollOffset } from '../helpers/scroll.js'
import HeroCarousel from './HeroCarousel.js'
import ContentRail from './ContentRail.js'

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// x="64" matches CONTENT_PADDING_X, 880 + index * 506 matches HERO_HEIGHT / RAIL_HEIGHT.

/**
 * Generic OTT page layout: a hero carousel followed by any number of content
 * rails, stacked vertically with a smooth scroll. Handles the Up/Down section
 * navigation and remembers which section (and which card within it) was last
 * focused, so returning to a page restores exactly where the user left off.
 */
export default Blits.Component('PageContainer', {
  components: {
    HeroCarousel,
    ContentRail,
  },
  template: `
    <Element :y.transition="$scrollTransition">
      <HeroCarousel ref="hero" :slides="$hero" />
      <ContentRail
        :for="(rail, index) in $rails"
        key="$rail.id"
        :ref="'rail' + $index"
        x="64"
        :y="880 + $index * 506"
        :title="$rail.title"
        :items="$rail.items"
      />
    </Element>
  `,
  props: {
    hero: [],
    rails: [],
  },
  state() {
    return {
      /**
       * Index of the currently focused vertical section: 0 is the hero, 1..N are rails
       * @type {number}
       */
      sectionIndex: 0,
    }
  },
  computed: {
    /**
     * Vertical pixel offset needed to bring the focused section into view
     * @returns {number}
     */
    scrollOffset() {
      return getPageScrollOffset(this.sectionIndex, HERO_HEIGHT, RAIL_HEIGHT, NAVBAR_HEIGHT)
    },
    /**
     * Transition config that smoothly scrolls the page to the focused section
     * @returns {object}
     */
    scrollTransition() {
      return transition(-this.scrollOffset, { duration: DURATION.slow, easing: EASING.smooth })
    },
  },
  hooks: {
    /**
     * Registers the listener that lets the Navbar hand focus off into this page
     * @returns {void}
     */
    init() {
      this.$listen('nav:focus-content', () => this.focusCurrentSection())
    },
  },
  input: {
    /**
     * Moves focus down to the next rail, or does nothing past the last rail
     * @returns {void}
     */
    down() {
      if (this.sectionIndex >= this.rails.length) return
      this.sectionIndex++
      this.focusCurrentSection()
    },
    /**
     * Moves focus up to the previous section, or hands focus back to the Navbar
     * @returns {void}
     */
    up() {
      if (this.sectionIndex <= 0) {
        this.$emit('nav:focus-navbar')
        return
      }
      this.sectionIndex--
      this.focusCurrentSection()
    },
    /**
     * Hands focus back to the Navbar as a quick escape action
     * @returns {void}
     */
    back() {
      this.$emit('nav:focus-navbar')
    },
  },
  methods: {
    /**
     * Focuses whichever section (hero or rail) matches the current sectionIndex
     * @returns {void}
     */
    focusCurrentSection() {
      const ref = this.sectionIndex === 0 ? 'hero' : `rail${this.sectionIndex - 1}`
      const target = this.$select(ref)
      if (target) target.$focus()
    },
  },
})
