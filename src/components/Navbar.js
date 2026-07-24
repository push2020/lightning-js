import Blits from '@lightningjs/blits'
import { playFocusSound, playSelectSound } from '../helpers/focusSound.js'
import { NAVBAR_SLIDE, NAVBAR_NAV_DELAY } from '../constants/animation.js'

const TABS = [
  { label: 'Home', path: '/', pillWidth: 117 },
  { label: 'Movies', path: '/movies', pillWidth: 133 },
  { label: 'Shows', path: '/shows', pillWidth: 128 },
  { label: 'Sports', path: '/sports', pillWidth: 124 },
]

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// 1920x130 matches constants/layout.js STAGE_W/NAVBAR_HEIGHT. Tab x position
// starts at 284 (CONTENT_PADDING_X 64 + 220 for the logo) with 130px spacing.
// The highlight pill sits 16px left of a tab's text and 12px above it
// (y 40 - 12 = 28, hardcoded in the template), so the single sliding pill lands
// exactly over each label.
const TAB_X0 = 284
const TAB_X_STEP = 130
const PILL_X_INSET = 16

/**
 * Premium top navigation bar. Owns real keyboard focus while the user is
 * browsing tabs: Left/Right move the tab cursor and switch pages, Down/Enter
 * hand focus off into the current page's content.
 */
export default Blits.Component('Navbar', {
  template: `
    <Element w="1920" h="130" color="{top: 'rgba(11, 11, 11, 0.95)', bottom: 'rgba(11, 11, 11, 0.95)'}" z="100">
      <Text content="JioTV+" size="40" color="#00B3FF" x="64" y="46" />
      <Element :x.transition="$pillTransition" :y="28" :w.transition="$pillWidthTransition" h="60" :rounded="30" color="#FFFFFF" />
      <Element :for="(tab, index) in $tabs" key="$tab.path" :x="284 + $index * 130" y="40">
        <Text
          :content="$tab.label"
          size="32"
          :color="$index === $focusIndex ? '#0B0B0B' : '#AAAAAA'"
          :scale="$index === $focusIndex && $$hasFocus ? 1.12 : 1"
        />
      </Element>
    </Element>
  `,
  state() {
    return {
      /**
       * List of navigable tabs, shown left to right
       * @type {{label: string, path: string}[]}
       */
      tabs: TABS,
      /**
       * Index of the currently highlighted navigation tab
       * @type {number}
       */
      focusIndex: 0,
    }
  },
  computed: {
    /**
     * Left edge of the highlight pill for the currently focused tab
     * @returns {number}
     */
    pillX() {
      return TAB_X0 + this.focusIndex * TAB_X_STEP - PILL_X_INSET
    },
    /**
     * Width of the highlight pill, sized to the currently focused tab's label
     * @returns {number}
     */
    pillWidth() {
      return this.tabs[this.focusIndex].pillWidth
    },
    /**
     * Reactive x transition so the pill glides between tabs on Left/Right
     * @returns {{value: number, duration: number, easing: string}}
     */
    pillTransition() {
      return { value: this.pillX, duration: NAVBAR_SLIDE.duration, easing: NAVBAR_SLIDE.easing }
    },
    /**
     * Reactive width transition so the pill grows/shrinks as it slides between
     * tabs of different label widths
     * @returns {{value: number, duration: number, easing: string}}
     */
    pillWidthTransition() {
      return { value: this.pillWidth, duration: NAVBAR_SLIDE.duration, easing: NAVBAR_SLIDE.easing }
    },
  },
  hooks: {
    /**
     * Syncs the highlighted tab with whichever route is active when the app boots
     * @returns {void}
     */
    ready() {
      this.syncFocusIndexWithRoute()
    },
    /**
     * Re-syncs the highlighted tab whenever the Navbar regains focus
     * @returns {void}
     */
    focus() {
      this.syncFocusIndexWithRoute()
    },
    /**
     * Cancels any pending deferred navigation when the Navbar is torn down
     * @returns {void}
     */
    destroy() {
      if (this._navTimer) this.$clearTimeout(this._navTimer)
    },
  },
  input: {
    /**
     * Moves the tab cursor left and navigates to that tab's page
     * @returns {void}
     */
    left() {
      if (this.focusIndex <= 0) return
      this.selectTab(this.focusIndex - 1)
    },
    /**
     * Moves the tab cursor right and navigates to that tab's page
     * @returns {void}
     */
    right() {
      if (this.focusIndex >= this.tabs.length - 1) return
      this.selectTab(this.focusIndex + 1)
    },
    /**
     * Hands focus down into the current page's content
     * @returns {void}
     */
    down() {
      playSelectSound()
      this.$emit('nav:focus-content')
    },
    /**
     * Enter behaves the same as Down here, drilling into the page content
     * @returns {void}
     */
    enter() {
      playSelectSound()
      this.$emit('nav:focus-content')
    },
  },
  methods: {
    /**
     * Moves the highlight cursor to the given tab (the pill slides there) and
     * schedules the page render after a minimal delay, so the slide starts
     * before the heavy page render and rapid held Left/Right only renders the
     * tab the user actually lands on.
     * @param {number} index - target tab index
     * @returns {void}
     */
    selectTab(index) {
      this.focusIndex = index
      playFocusSound()
      this.scheduleNavigation(index)
    },
    /**
     * Debounced, slightly-delayed navigation to a tab's page. Any pending
     * navigation is cancelled first so only the final tab in a fast scroll is
     * rendered.
     * @param {number} index - target tab index
     * @returns {void}
     */
    scheduleNavigation(index) {
      if (this._navTimer) this.$clearTimeout(this._navTimer)
      this._navTimer = this.$setTimeout(() => {
        this._navTimer = null
        this.$router.to(this.tabs[index].path)
      }, NAVBAR_NAV_DELAY)
    },
    /**
     * Updates focusIndex to match the tab whose path matches the current route
     * @returns {void}
     */
    syncFocusIndexWithRoute() {
      const matchIndex = this.tabs.findIndex((tab) => tab.path === this.$router.currentRoute.path)
      if (matchIndex >= 0) this.focusIndex = matchIndex
    },
  },
})
