import Blits from '@lightningjs/blits'
import { CARD_W, CARD_GAP, RAIL_VISIBLE_WIDTH } from '../constants/layout.js'
import { getRailScrollOffset } from '../helpers/scroll.js'
import { playFocusSound, playSelectSound } from '../helpers/focusSound.js'
import { getTierConfig } from '../helpers/deviceTier.js'
import PosterCard from './PosterCard.js'

// How many cards fit in the rail's visible viewport at once, used to size
// the virtualization window (see state.winStart/winEnd below).
const VISIBLE_CARDS = Math.ceil(RAIL_VISIBLE_WIDTH / (CARD_W + CARD_GAP)) + 1
const { cardBuffer: CARD_BUFFER } = getTierConfig().window

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// 466 = RAIL_TITLE_HEIGHT (76) + CARD_H (390). 1792 = RAIL_VISIBLE_WIDTH.
// 288 = CARD_W (260) + CARD_GAP (28). Keep these in sync with constants/layout.js.
// The card track sits in a slightly taller/wider box than the cards themselves
// (24px vertical buffer, 20px left inset) so the focused card's border never
// gets clipped by the track boundary.
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
      <Text :content="$title" size="32" :color="$$hasFocus ? '#FFFFFF' : '#AAAAAA'" />
      <Element y="52" w="1812" h="438" clipping="true">
        <Element :x="-$scrollOffset">
          <PosterCard
            :for="(item, index) in $items"
            :range="{from: $winStart, to: $winEnd}"
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
      /**
       * Index of the first card mounted by the :range virtualization window
       * @type {number}
       */
      winStart: 0,
      /**
       * Index one past the last card mounted by the :range virtualization window
       * @type {number}
       */
      winEnd: VISIBLE_CARDS + CARD_BUFFER,
    }
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
     * Recalculates the scroll offset so the selected card stays comfortably
     * in view, and slides the mount window so only cards near the selection
     * are instantiated
     * @returns {void}
     */
    updateScroll() {
      this.scrollOffset = getRailScrollOffset(this.selectedIndex, CARD_W, CARD_GAP)
      this.winStart = Math.max(0, this.selectedIndex - CARD_BUFFER)
      this.winEnd = this.selectedIndex + VISIBLE_CARDS + CARD_BUFFER
    },
  },
})
