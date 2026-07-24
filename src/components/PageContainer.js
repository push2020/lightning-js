import Blits from '@lightningjs/blits'
import {
  CARD_W,
  CARD_H,
  CARD_PEEK_WIDTH,
  HERO_HEIGHT,
  RAIL_HEIGHT,
  NAVBAR_HEIGHT,
  getRailFocusBorderScreenY,
} from '../constants/layout.js'
import { getPageScrollOffset } from '../helpers/scroll.js'
import { getTierConfig } from '../helpers/deviceTier.js'
import { markFastScroll, scheduleSettle } from '../helpers/loadGate.js'
import {
  SCROLL_TRANSITION_DURATION,
  SCROLL_TRANSITION_EASING,
  VERTICAL_SCROLL,
  CARD_LIFT,
} from '../constants/animation.js'
import HeroCarousel from './HeroCarousel.js'
import ContentRail from './ContentRail.js'
import FocusBorder from './FocusBorder.js'

const { railBufferUp: RAIL_BUFFER_UP, railBufferDown: RAIL_BUFFER_DOWN, railVisibleRows: RAIL_VISIBLE_ROWS } =
  getTierConfig().window

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// 880 + index * 506 matches HERO_HEIGHT / RAIL_HEIGHT. ContentRail sits at
// x="0" (not CONTENT_PADDING_X) because its card track is full-bleed,
// edge-to-edge like HeroCarousel - ContentRail applies its own x="64" inset
// internally, just to its title text, to line up with the hero's title.
// The rail FocusBorder lives on this component at a fixed screen position
// (Prime-style): vertical page scroll slides the stack behind it; horizontal
// card scroll slides each rail's track underneath the same frame.

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
    FocusBorder,
  },
  template: `
    <Element w="1920" h="1080" clipping="true">
      <Element :y.transition="$scrollTransition">
        <HeroCarousel ref="hero" :slides="$hero" />
        <ContentRail
          :for="(rail, index) in $rails"
          :range="{from: $railWinStart, to: $railWinEnd}"
          key="$rail.id"
          :ref="'rail' + $index"
          :y="880 + $index * 506"
          :title="$rail.title"
          :items="$rail.items"
          :cardW="$rail.cardW"
          :cardH="$rail.cardH"
        />
      </Element>
      <FocusBorder
        :active="$showRailFocusBorder"
        x="64"
        :y="$railFocusBorderY"
        :w="$railFocusBorderW"
        :h="$railFocusBorderH"
        zIndex="20"
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
      /**
       * Whether keyboard focus is inside this page (hero or a rail), not the Navbar
       * @type {boolean}
       */
      contentHasFocus: false,
      /**
       * Suppresses the rail focus border while the page is still scrolling up
       * out of the hero into the first rail. The border sits at a fixed screen
       * slot, so without this it would appear over the hero before the rail has
       * slid into place. Cleared once the scroll settles.
       * @type {boolean}
       */
      railBorderSuppressed: false,
      /**
       * Index of the first rail mounted by the :range virtualization window
       * @type {number}
       */
      railWinStart: 0,
      /**
       * Index one past the last rail mounted by the :range virtualization window
       * @type {number}
       */
      railWinEnd: RAIL_VISIBLE_ROWS + RAIL_BUFFER_DOWN,
      /**
       * Inclusive bounds of the rail index range covered by the current scroll
       * animation; widens the :range window so rails along the path stay mounted.
       * @type {number}
       */
      railSpanLo: 0,
      /** @type {number} */
      railSpanHi: 0,
      /**
       * Duration (ms) of the current page scroll transition. Shortened while a
       * direction key is held so held-scroll stays smooth; restored to the full
       * settle duration for a single, deliberate press.
       * @type {number}
       */
      scrollDuration: SCROLL_TRANSITION_DURATION,
      /**
       * Easing of the current page scroll transition; near-linear while holding.
       * @type {string}
       */
      scrollEasing: SCROLL_TRANSITION_EASING,
    }
  },
  computed: {
    scrollOffset() {
      return getPageScrollOffset(this.sectionIndex, HERO_HEIGHT, RAIL_HEIGHT, NAVBAR_HEIGHT)
    },
    scrollTransition() {
      return {
        value: -this.scrollOffset,
        duration: this.scrollDuration,
        easing: this.scrollEasing,
      }
    },
    focusedRail() {
      if (this.sectionIndex <= 0) return null
      return this.rails[this.sectionIndex - 1] ?? null
    },
    railFocusBorderW() {
      return this.focusedRail?.cardW ?? CARD_W
    },
    railFocusBorderH() {
      return this.focusedRail?.cardH ?? CARD_H
    },
    railFocusBorderY() {
      // Offset up by the hover-lift so the fixed border keeps framing the
      // focused card, which lifts by CARD_LIFT.offset (see ContentRail.js).
      return getRailFocusBorderScreenY(this.railFocusBorderH, NAVBAR_HEIGHT) - CARD_LIFT.offset
    },
    showRailFocusBorder() {
      return this.contentHasFocus && this.sectionIndex > 0 && !this.railBorderSuppressed
    },
  },
  hooks: {
    init() {
      this.$listen('nav:focus-content', () => {
        this.contentHasFocus = true
        this.focusCurrentSection()
      })
    },
    destroy() {
      clearTimeout(this._railCompactTimer)
      clearTimeout(this._borderRevealTimer)
    },
  },
  input: {
    down() {
      if (this.sectionIndex >= this.rails.length) return
      if (!this.gateScrollStep()) return
      this.contentHasFocus = true
      const leavingHero = this.sectionIndex === 0
      this.sectionIndex++
      if (leavingHero) this.suppressRailBorderUntilSettled()
      this.updateRailWindow()
      this.focusCurrentSection()
    },
    up() {
      if (this.sectionIndex <= 0) {
        this.contentHasFocus = false
        this.$emit('nav:focus-navbar')
        return
      }
      if (!this.gateScrollStep()) return
      this.sectionIndex--
      this.updateRailWindow()
      this.focusCurrentSection()
    },
    back() {
      this.contentHasFocus = false
      this.$emit('nav:focus-navbar')
    },
  },
  methods: {
    /**
     * Rate-limits held-key auto-repeat and picks the scroll transition speed.
     * Drops repeats arriving faster than NAV_THROTTLE_MS so held scroll doesn't
     * fly past sections; when a step is accepted, uses the short near-linear
     * transition for held scroll and the full smooth settle for a single press.
     * @returns {boolean} true if the caller should proceed with the step
     */
    gateScrollStep() {
      const cfg = VERTICAL_SCROLL
      const now = performance.now()
      const dt = now - (this._lastNavAt ?? -Infinity)
      if (dt < cfg.throttleMs) return false
      const fast = dt < cfg.fastWindowMs
      this.scrollDuration = fast ? cfg.fastDuration : cfg.settleDuration
      this.scrollEasing = fast ? cfg.fastEasing : cfg.settleEasing
      if (fast) markFastScroll()
      this._lastNavAt = now
      return true
    },
    focusCurrentSection() {
      const ref = this.sectionIndex === 0 ? 'hero' : `rail${this.sectionIndex - 1}`
      const target = this.$select(ref)
      if (target) target.$focus()
    },
    /**
     * Hides the rail focus border until the hero-to-rail scroll settles, so the
     * fixed-slot border doesn't flash over the hero before the first rail has
     * slid into place. Uses the current step's scroll duration so the reveal
     * lines up with the rail arriving.
     * @returns {void}
     */
    suppressRailBorderUntilSettled() {
      this.railBorderSuppressed = true
      clearTimeout(this._borderRevealTimer)
      // The scroll easing is a strong ease-out, so the rail visually reaches its
      // slot in roughly the first half of the duration; reveal the border then
      // rather than after the full settle, which reads as laggy.
      this._borderRevealTimer = setTimeout(() => {
        this.railBorderSuppressed = false
      }, this.scrollDuration * 0.4)
    },
    updateRailWindow() {
      const railIndex = this.sectionIndex - 1

      if (railIndex < 0) {
        this.railWinStart = 0
        this.railWinEnd = Math.min(this.rails.length, RAIL_VISIBLE_ROWS + RAIL_BUFFER_DOWN)
        this.scheduleRailWindowCompact()
        return
      }

      const prevRailIndex = this.sectionIndex - 2

      if (!this._railCompactTimer) {
        if (prevRailIndex >= 0) {
          this.railSpanLo = Math.min(prevRailIndex, railIndex)
          this.railSpanHi = Math.max(prevRailIndex, railIndex)
        } else {
          this.railSpanLo = railIndex
          this.railSpanHi = railIndex
        }
      } else {
        this.railSpanLo = Math.min(this.railSpanLo, railIndex)
        this.railSpanHi = Math.max(this.railSpanHi, railIndex)
      }

      this.railWinStart = Math.max(0, this.railSpanLo - RAIL_BUFFER_UP)
      this.railWinEnd = Math.min(
        this.rails.length,
        this.railSpanHi + RAIL_VISIBLE_ROWS + RAIL_BUFFER_DOWN,
      )
      this.scheduleRailWindowCompact()
    },
    compactRailWindow() {
      const railIndex = this.sectionIndex - 1
      if (railIndex < 0) {
        this.railWinStart = 0
        this.railWinEnd = Math.min(this.rails.length, RAIL_VISIBLE_ROWS + RAIL_BUFFER_DOWN)
        scheduleSettle()
        return
      }
      this.railSpanLo = railIndex
      this.railSpanHi = railIndex
      this.railWinStart = Math.max(0, railIndex - RAIL_BUFFER_UP)
      this.railWinEnd = Math.min(this.rails.length, railIndex + RAIL_VISIBLE_ROWS + RAIL_BUFFER_DOWN)
      scheduleSettle()
    },
    scheduleRailWindowCompact() {
      clearTimeout(this._railCompactTimer)
      this._railCompactTimer = setTimeout(() => {
        this._railCompactTimer = null
        this.compactRailWindow()
      }, SCROLL_TRANSITION_DURATION)
    },
  },
})
