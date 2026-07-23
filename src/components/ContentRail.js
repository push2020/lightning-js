import Blits from '@lightningjs/blits'
import { CARD_W, CARD_H, CARD_GAP, CARD_PEEK_WIDTH, STAGE_W } from '../constants/layout.js'
import { getRailScrollOffset } from '../helpers/scroll.js'
import { playFocusSound, playSelectSound } from '../helpers/focusSound.js'
import { getTierConfig } from '../helpers/deviceTier.js'
import { SCROLL_TRANSITION_DURATION, SCROLL_TRANSITION_EASING } from '../constants/animation.js'
import PosterCard from './PosterCard.js'
import FocusBorder from './FocusBorder.js'

// How many extra cards are mounted on each side of the visible window (see
// state.winStart/winEnd below), sized per device tier. How many cards are
// *visible* on screen at once isn't a fixed tier number though - it depends
// on how wide this particular rail's cards are (portrait vs landscape), so
// that part is computed per-instance from the card width - see
// visibleCards()/updateScroll() below.
const { cardBuffer: CARD_BUFFER } = getTierConfig().window

// Track box height (see the h="438" Element below): fixed regardless of card
// variant, so every rail occupies the same overall height (RAIL_HEIGHT) on
// the page - a shorter landscape card is simply centered vertically within
// it instead of shrinking the rail itself.
const TRACK_H = 438

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// 466 = RAIL_TITLE_HEIGHT (76) + CARD_H (390). 1920 = STAGE_W: the card track
// is full-bleed edge-to-edge across the whole screen, same as HeroSlide's
// background image, while the rail title keeps its own x="64" inset to line
// up with the hero's title/Navbar (see CONTENT_PADDING_X).
// The card track sits in a taller box (TRACK_H = 438) than any single card
// variant, and cardY (see computed below) centers the card vertically inside
// it, so the focus border never gets clipped by the track's top/bottom
// boundary regardless of whether this rail uses portrait or landscape cards.
// The row starts at y="52" (52 + 24 default portrait buffer = 76), leaving
// extra padding between the rail title and the first row of cards.
// The focus border is rendered once, fixed at x="64" (= CARD_PEEK_WIDTH,
// lining up with the rail title's own x="64") rather than on whichever card
// is selected - getRailScrollOffset() always slides the selected card into
// that same slot, so visually the border stays put and the card track
// glides underneath it, and the first card always rests at this same usual
// position. Only once you've scrolled past it does the previous card's edge
// start peeking/cutting off at the rail's true left edge instead of
// scrolling fully out of sight (a peek carousel). On the right, cards
// simply run off the full-bleed 1920px track and get cut by the true screen
// edge - the same "edge cutting" as the left, but only once scrolled there.

/**
 * A horizontally scrolling rail of poster cards. The rail itself owns real
 * keyboard focus - Left/Right moves the selected card, and the previously
 * selected card is remembered for as long as this component instance lives.
 */
export default Blits.Component('ContentRail', {
  components: {
    PosterCard,
    FocusBorder,
  },
  template: `
    <Element h="466">
      <Text x="64" :content="$title" size="32" :color="$$hasFocus ? '#FFFFFF' : '#AAAAAA'" />
      <Element y="52" w="1920" h="438" clipping="true">
        <Element :x.transition="$trackTransition">
          <PosterCard
            :for="(item, index) in $items"
            :range="{from: $winStart, to: $winEnd}"
            key="$item.id"
            :y="$cardY"
            :x="$index * $cardStep"
            :title="$item.title"
            :genre="$item.genre"
            :image="$item.image"
            :progress="$item.progress"
            :w="$cardW"
            :h="$cardH"
          />
        </Element>
        <FocusBorder :active="$$hasFocus" x="64" :y="$cardY" :w="$cardW" :h="$cardH" zIndex="10" />
      </Element>
    </Element>
  `,
  props: {
    title: '',
    items: [],
    /**
     * Width of each card, in pixels - portrait (CARD_W) by default, or wider
     * for a landscape rail
     */
    cardW: CARD_W,
    /**
     * Height of each card, in pixels - portrait (CARD_H) by default, or
     * shorter for a landscape rail
     */
    cardH: CARD_H,
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
      scrollOffset: getRailScrollOffset(0, this.cardW, CARD_GAP, CARD_PEEK_WIDTH),
      /**
       * Index of the first card mounted by the :range virtualization window
       * @type {number}
       */
      winStart: 0,
      /**
       * Index one past the last card mounted by the :range virtualization window.
       * Computed inline here (rather than via the visibleCards() computed
       * below) because computed properties aren't set up yet when state() runs.
       * @type {number}
       */
      winEnd: Math.ceil(STAGE_W / (this.cardW + CARD_GAP)) + CARD_BUFFER,
    }
  },
  computed: {
    /**
     * Horizontal distance between the start of one card and the next
     * @returns {number}
     */
    cardStep() {
      return this.cardW + CARD_GAP
    },
    /**
     * Vertical offset that centers this rail's cards within the fixed-height
     * track box, so portrait and landscape rails occupy the same overall
     * rail height on the page
     * @returns {number}
     */
    cardY() {
      return Math.round((TRACK_H - this.cardH) / 2)
    },
    /**
     * How many cards fit across the screen at once for this rail's card
     * width, used to size the virtualization window
     * @returns {number}
     */
    visibleCards() {
      return Math.ceil(STAGE_W / this.cardStep)
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
      this.scrollOffset = getRailScrollOffset(this.selectedIndex, this.cardW, CARD_GAP, CARD_PEEK_WIDTH)
      this.winStart = Math.max(0, this.selectedIndex - CARD_BUFFER)
      this.winEnd = this.selectedIndex + this.visibleCards + CARD_BUFFER
    },
  },
})
