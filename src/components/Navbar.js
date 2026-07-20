import Blits from '@lightningjs/blits'
import { playFocusSound, playSelectSound } from '../helpers/focusSound.js'

const TABS = [
  { label: 'Home', path: '/' },
  { label: 'Movies', path: '/movies' },
  { label: 'Shows', path: '/shows' },
  { label: 'Sports', path: '/sports' },
]

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// 1920x130 matches constants/layout.js STAGE_W/NAVBAR_HEIGHT. Tab x position
// starts at 284 (CONTENT_PADDING_X 64 + 220 for the logo) with 130px spacing.

/**
 * Premium top navigation bar. Owns real keyboard focus while the user is
 * browsing tabs: Left/Right move the tab cursor and switch pages, Down/Enter
 * hand focus off into the current page's content.
 */
export default Blits.Component('Navbar', {
  template: `
    <Element w="1920" h="130" color="{top: 'rgba(11, 11, 11, 0.95)', bottom: 'rgba(11, 11, 11, 0.95)'}" z="100">
      <Text content="JioTV+" size="40" color="#00B3FF" x="64" y="46" />
      <Element :for="(tab, index) in $tabs" key="$tab.path" :x="284 + $index * 130" y="40">
        <Text
          :content="$tab.label"
          size="32"
          :color="$index === $focusIndex ? '#FFFFFF' : '#AAAAAA'"
          :scale.transition="{value: $index === $focusIndex && $$hasFocus ? 1.12 : 1, duration: 200, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'}"
        />
        <Element
          y="46"
          h="4"
          :rounded="2"
          color="#00B3FF"
          :w.transition="{value: $index === $focusIndex ? 70 : 0, duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)'}"
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
     * Navigates to the tab at the given index and updates the highlighted cursor
     * @param {number} index - target tab index
     * @returns {void}
     */
    selectTab(index) {
      this.focusIndex = index
      playFocusSound()
      this.$router.to(this.tabs[index].path)
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
