import Blits from '@lightningjs/blits'
import { RAIL_VISIBLE_WIDTH, getCardConfig } from '../constants/layout.js'
import { getRailScrollOffset } from '../helpers/scroll.js'
import { playFocusSound, playSelectSound } from '../helpers/focusSound.js'
import { getTierConfig } from '../helpers/deviceTier.js'
import { SCROLL_TRANSITION_DURATION, SCROLL_TRANSITION_EASING } from '../constants/animation.js'
import PosterCard from './PosterCard.js'
import FocusBorder from './FocusBorder.js'

const { cardBuffer: CARD_BUFFER } = getTierConfig().window

/**
 * Number of cards of a given shape that fit in the rail's visible viewport at
 * once, used to size the virtualization window (see state.winStart/winEnd
 * below). Narrower cards (e.g. circular) fit more on screen and so get a
 * larger window; wider cards (e.g. landscape) get a smaller one - this keeps
 * the mount count matched to what's actually visible instead of over-mounting.
 * @param {number} cardW - width of a single card in pixels
 * @param {number} cardGap - horizontal spacing after a card in pixels
 * @returns {number} number of cards visible in the rail viewport
 */
function getVisibleCards(cardW, cardGap) {
  return Math.ceil(RAIL_VISIBLE_WIDTH / (cardW + cardGap))
}

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// 466 = RAIL_TITLE_HEIGHT (76) + CARD_H (390). 1792 = RAIL_VISIBLE_WIDTH.
// 438 = the tallest card's buffered height (CARD_H 390 + 24 top/bottom
// buffer + 24 extra), shared by every card shape since all CARD_TYPES
// entries are shorter than or equal to portrait's 390. Keep these in sync
// with constants/layout.js.
// The card track sits in a slightly taller/wider box than the cards themselves
// (24px vertical buffer, 20px left inset) so the fixed focus border never
// gets clipped by the track boundary.
// The row starts at y="52" (52 + 24 buffer = 76), leaving extra padding
// between the rail title and the first row of cards.
// The focus border is rendered once, fixed at the leftmost card slot
// (x="20" y="24", matching the card track's own inset) rather than on
// whichever card is selected - getRailScrollOffset() always slides the
// selected card into that same slot, so visually the border stays put and
// the card track glides underneath it.

/**
 * A horizontally scrolling rail of poster cards. The rail itself owns real
 * keyboard focus - Left/Right moves the selected card, and the previously
 * selected card is remembered for as long as this component instance lives.
 * Cards render in one of a few shapes (portrait/landscape/circular, see
 * `cardType`), all driven from the same item data.
 */
export default Blits.Component('ContentRail', {
  components: {
    PosterCard,
    FocusBorder,
  },
  template: `
    <Element h="466">
      <Text :content="$title" size="32" :color="$$hasFocus ? '#FFFFFF' : '#AAAAAA'" />
      <Element y="52" w="1812" h="438" clipping="true">
        <Element :x.transition="$trackTransition">
          <PosterCard
            :for="(item, index) in $items"
            :range="{from: $winStart, to: $winEnd}"
            key="$item.id"
            y="24"
            :x="20 + $index * ($cardW + $cardGap)"
            :title="$item.title"
            :genre="$item.genre"
            :image="$item.image"
            :progress="$item.progress"
            :w="$cardW"
            :h="$cardH"
            :imageH="$cardImageH"
            :rounded="$cardRounded"
          />
        </Element>
        <FocusBorder :active="$$hasFocus" x="20" y="24" :w="$cardW" :h="$cardH" :rounded="$focusRounded" zIndex="10" />
      </Element>
    </Element>
  `,
  props: {
    title: '',
    items: [],
    /**
     * Card shape rendered by this rail: 'portrait' | 'landscape' | 'circular'
     */
    cardType: 'portrait',
  },
  state() {
    const { w, gap } = getCardConfig(this.cardType)
    const visibleCards = getVisibleCards(w, gap)
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
      winEnd: visibleCards + CARD_BUFFER,
    }
  },
  computed: {
    /**
     * Width of a single card for this rail's shape, in pixels
     * @returns {number}
     */
    cardW() {
      return getCardConfig(this.cardType).w
    },
    /**
     * Height of a single card for this rail's shape, in pixels
     * @returns {number}
     */
    cardH() {
      return getCardConfig(this.cardType).h
    },
    /**
     * Horizontal gap after a card for this rail's shape, in pixels
     * @returns {number}
     */
    cardGap() {
      return getCardConfig(this.cardType).gap
    },
    /**
     * Poster image height for this rail's shape, in pixels
     * @returns {number}
     */
    cardImageH() {
      return getCardConfig(this.cardType).imageH
    },
    /**
     * Corner radius applied to the poster image for this rail's shape
     * @returns {number}
     */
    cardRounded() {
      return getCardConfig(this.cardType).rounded
    },
    /**
     * Corner radius applied to the focus border. For circular cards this is
     * recalculated against the border's own (8px larger) bounding box so the
     * ring stays a true circle instead of the image's smaller radius.
     * @returns {number}
     */
    focusRounded() {
      return this.cardType === 'circular' ? (this.cardW + 16) / 2 : this.cardRounded
    },
    /**
     * Number of cards of this rail's shape visible in the viewport at once
     * @returns {number}
     */
    visibleCards() {
      return getVisibleCards(this.cardW, this.cardGap)
    },
    /**
     * Transition config that smoothly slides the card track to reveal the
     * selected card, instead of jumping straight to the target offset
     * @returns {{value: number, duration: number, easing: string}}
     */
    trackTransition() {
      return {
        value: -this.scrollOffset,
        duration: SCROLL_TRANSITION_DURATION,
        easing: SCROLL_TRANSITION_EASING,
      }
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
     * Recalculates the scroll offset so the selected card stays comfortably
     * in view, and slides the mount window so only cards near the selection
     * are instantiated
     * @returns {void}
     */
    updateScroll() {
      this.scrollOffset = getRailScrollOffset(this.selectedIndex, this.cardW, this.cardGap)
      this.winStart = Math.max(0, this.selectedIndex - CARD_BUFFER)
      this.winEnd = this.selectedIndex + this.visibleCards + CARD_BUFFER
    },
  },
})
