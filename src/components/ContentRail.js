import Blits from '@lightningjs/blits'
import { CARD_W, CARD_H, CARD_GAP, CARD_PEEK_WIDTH, STAGE_W, getCardYInRailTrack } from '../constants/layout.js'
import { getRailScrollOffset } from '../helpers/scroll.js'
import { playFocusSound, playSelectSound } from '../helpers/focusSound.js'
import { getTierConfig } from '../helpers/deviceTier.js'
import { markFastScroll, scheduleSettle } from '../helpers/loadGate.js'
import {
  SCROLL_TRANSITION_DURATION,
  SCROLL_TRANSITION_EASING,
  HORIZONTAL_SCROLL,
} from '../constants/animation.js'
import PosterCard from './PosterCard.js'

const { cardBuffer: CARD_BUFFER } = getTierConfig().window

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// 466 = RAIL_TITLE_HEIGHT (76) + CARD_H (390). 1920 = STAGE_W: the card track
// is full-bleed edge-to-edge across the whole screen, same as HeroSlide's
// background image, while the rail title keeps its own x="64" inset to line
// up with the hero's title/Navbar (see CONTENT_PADDING_X).
// The card track sits in a taller box (RAIL_TRACK_H = 438) than any single card
// variant, and cardY centers the card vertically inside it.
// The row starts at y="52", leaving extra padding between the rail title and cards.
// PageContainer renders the focus border at a fixed screen slot; getRailScrollOffset()
// slides the card track underneath that frame on Left/Right (Prime-style).

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
            :lifted="$index === $selectedIndex && $$hasFocus"
          />
        </Element>
      </Element>
    </Element>
  `,
  props: {
    title: '',
    items: [],
    cardW: CARD_W,
    cardH: CARD_H,
  },
  state() {
    return {
      selectedIndex: 0,
      scrollOffset: getRailScrollOffset(0, this.cardW, CARD_GAP, CARD_PEEK_WIDTH),
      winStart: 0,
      winEnd: Math.ceil(STAGE_W / (this.cardW + CARD_GAP)) + CARD_BUFFER,
      cardSpanLo: 0,
      cardSpanHi: 0,
      /**
       * Duration (ms) of the current card-track transition. Shortened while
       * Left/Right is held so held-scroll stays smooth; restored to the full
       * settle duration for a single, deliberate press.
       * @type {number}
       */
      trackDuration: SCROLL_TRANSITION_DURATION,
      /**
       * Easing of the current card-track transition; near-linear while holding.
       * @type {string}
       */
      trackEasing: SCROLL_TRANSITION_EASING,
    }
  },
  computed: {
    cardStep() {
      return this.cardW + CARD_GAP
    },
    cardY() {
      return getCardYInRailTrack(this.cardH)
    },
    visibleCards() {
      return Math.ceil(STAGE_W / this.cardStep)
    },
    trackTransition() {
      return {
        value: -this.scrollOffset,
        duration: this.trackDuration,
        easing: this.trackEasing,
      }
    },
  },
  hooks: {
    destroy() {
      clearTimeout(this._cardCompactTimer)
    },
  },
  input: {
    left() {
      if (this.selectedIndex <= 0) return
      if (!this.gateScrollStep()) return
      const prevIndex = this.selectedIndex
      this.selectedIndex--
      this.updateScroll(prevIndex)
      playFocusSound()
    },
    right() {
      if (this.selectedIndex >= this.items.length - 1) return
      if (!this.gateScrollStep()) return
      const prevIndex = this.selectedIndex
      this.selectedIndex++
      this.updateScroll(prevIndex)
      playFocusSound()
    },
    enter() {
      playSelectSound()
    },
  },
  methods: {
    /**
     * Rate-limits held-key auto-repeat and picks the card-track transition
     * speed. Drops repeats arriving faster than NAV_THROTTLE_MS so held scroll
     * doesn't fly past cards; when a step is accepted, uses the short near-linear
     * transition for held scroll and the full smooth settle for a single press.
     * @returns {boolean} true if the caller should proceed with the step
     */
    gateScrollStep() {
      const cfg = HORIZONTAL_SCROLL
      const now = performance.now()
      const dt = now - (this._lastNavAt ?? -Infinity)
      if (dt < cfg.throttleMs) return false
      const fast = dt < cfg.fastWindowMs
      this.trackDuration = fast ? cfg.fastDuration : cfg.settleDuration
      this.trackEasing = fast ? cfg.fastEasing : cfg.settleEasing
      if (fast) markFastScroll()
      this._lastNavAt = now
      return true
    },
    updateScroll(prevIndex) {
      this.scrollOffset = getRailScrollOffset(this.selectedIndex, this.cardW, CARD_GAP, CARD_PEEK_WIDTH)

      if (!this._cardCompactTimer) {
        this.cardSpanLo = Math.min(prevIndex, this.selectedIndex)
        this.cardSpanHi = Math.max(prevIndex, this.selectedIndex)
      } else {
        this.cardSpanLo = Math.min(this.cardSpanLo, this.selectedIndex)
        this.cardSpanHi = Math.max(this.cardSpanHi, this.selectedIndex)
      }

      this.winStart = Math.max(0, this.cardSpanLo - CARD_BUFFER)
      this.winEnd = Math.min(this.items.length, this.cardSpanHi + this.visibleCards + CARD_BUFFER)
      this.scheduleCardWindowCompact()
    },
    compactCardWindow() {
      this.cardSpanLo = this.selectedIndex
      this.cardSpanHi = this.selectedIndex
      this.winStart = Math.max(0, this.selectedIndex - CARD_BUFFER)
      this.winEnd = Math.min(this.items.length, this.selectedIndex + this.visibleCards + CARD_BUFFER)
      scheduleSettle()
    },
    scheduleCardWindowCompact() {
      clearTimeout(this._cardCompactTimer)
      this._cardCompactTimer = setTimeout(() => {
        this._cardCompactTimer = null
        this.compactCardWindow()
      }, SCROLL_TRANSITION_DURATION)
    },
  },
})
