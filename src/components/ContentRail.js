import Blits from '@lightningjs/blits'
import { CARD_W, CARD_GAP } from '../constants/layout.js'
import { DURATION, EASING, transition } from '../helpers/animations.js'
import { getRailScrollOffset } from '../helpers/scroll.js'
import { playFocusSound, playSelectSound } from '../helpers/focusSound.js'
import PosterCard from './PosterCard.js'

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// 466 = RAIL_TITLE_HEIGHT (76) + CARD_H (390). 1792 = RAIL_VISIBLE_WIDTH.
// 288 = CARD_W (260) + CARD_GAP (28). Keep these in sync with constants/layout.js.
// The card track sits in a slightly taller/wider box than the cards themselves
// (24px vertical buffer, 20px left inset) so the focused card's scale-up
// animation has room to breathe without being clipped by the track boundary.
// The row starts at y="52" (52 + 24 buffer = 76), leaving extra padding
// between the rail title and the first row of cards.

/**
 * A horizontally scrolling rail of poster cards. The rail itself owns real
 * keyboard focus - Left/Right moves the selected card, and the previously
 * selected card is remembered for as long as this component instance lives.
 */
export default Blits.Component('ContentRail', {
  components: {
    PosterCard,
  },
  template: `
    <Element h="466">
      <Text :content="$title" size="32" font="raleway" :color="$$hasFocus ? '#FFFFFF' : '#AAAAAA'" />
      <Element y="52" w="1812" h="438" clipping="true">
        <Element :x.transition="$trackTransition">
          <PosterCard
            :for="(item, index) in $items"
            key="$item.id"
            y="24"
            :x="20 + $index * 288"
            :title="$item.title"
            :genre="$item.genre"
            :image="$item.image"
            :progress="$item.progress"
            :focused="$$hasFocus && $index === $selectedIndex"
            w="260"
            h="390"
          />
        </Element>
      </Element>
    </Element>
  `,
  props: {
    title: '',
    items: [],
  },
  state() {
    return {
      /**
       * Index of the currently selected card within this rail
       * @type {number}
       */
      selectedIndex: 0,
      /**
       * Current horizontal scroll offset of the card track, in pixels
       * @type {number}
       */
      scrollOffset: 0,
    }
  },
  computed: {
    /**
     * Transition config that smoothly scrolls the card track to reveal the selected card
     * @returns {object}
     */
    trackTransition() {
      return transition(-this.scrollOffset, { duration: DURATION.base, easing: EASING.smooth })
    },
  },
  input: {
    /**
     * Moves selection to the previous card in the rail
     * @returns {void}
     */
    left() {
      if (this.selectedIndex <= 0) return
      this.selectedIndex--
      this.updateScroll()
      playFocusSound()
    },
    /**
     * Moves selection to the next card in the rail
     * @returns {void}
     */
    right() {
      if (this.selectedIndex >= this.items.length - 1) return
      this.selectedIndex++
      this.updateScroll()
      playFocusSound()
    },
    /**
     * Confirms selection of the currently focused card
     * @returns {void}
     */
    enter() {
      playSelectSound()
    },
  },
  methods: {
    /**
     * Recalculates the scroll offset so the selected card stays comfortably in view
     * @returns {void}
     */
    updateScroll() {
      this.scrollOffset = getRailScrollOffset(this.selectedIndex, CARD_W, CARD_GAP)
    },
  },
})
