import Blits from '@lightningjs/blits'
import FocusBorder from './FocusBorder.js'

const OPTIONS = ['Cancel', 'Exit']

// Note: template values are hardcoded literals - see FocusBorder.js for why.
// Card is 760x260, centered horizontally when open (x=580, y=410).
//
// Important: Text children must never have an ancestor that starts at
// alpha=0 - if they do, the renderer skips their glyph-shaping pass on
// creation and never revisits it later, even after alpha changes back to 1
// (confirmed by direct testing; plain colored rects are unaffected, only
// Text is). So the card (which contains all the Text in this dialog) is
// hidden by moving it just off the right edge of the stage instead of via
// alpha - x=1920 keeps it within the default 300px viewportMargin (so it's
// not culled from the render tree either), while being fully outside the
// visible 1920-wide canvas. The dim backdrop has no Text in it, so it's
// safe to hide with a plain alpha toggle.

/**
 * Full-screen confirmation dialog shown when Back is pressed with nowhere
 * left to go back to (i.e. the Navbar itself is focused). Owns focus while
 * open: Left/Right move between Cancel/Exit, Enter confirms the highlighted
 * choice, and Back is treated the same as Cancel.
 */
export default Blits.Component('ExitConfirmModal', {
  components: {
    FocusBorder,
  },
  template: `
    <Element>
      <Element :alpha="$open ? 0.75 : 0" w="1920" h="1080" color="#000000" z="600" />
      <Element :x="$open ? 580 : 1920" y="410" w="760" h="260" color="#141414" z="600">
        <Text content="Exit App?" size="40" color="#FFFFFF" x="40" y="30" />
        <Text content="Are you sure you want to exit JioTV+?" size="24" color="#AAAAAA" x="40" y="86" />
        <Element
          :for="(option, index) in $options"
          key="$option"
          :x="40 + $index * 220"
          y="160"
          w="200"
          h="64"
          color="#1C1C1C"
        >
          <Text :content="$option" size="26" :color="$index === $selectedIndex ? '#FFFFFF' : '#AAAAAA'" x="0" y="18" />
          <FocusBorder :active="$index === $selectedIndex" w="200" h="64" />
        </Element>
      </Element>
    </Element>
  `,
  props: {
    open: false,
  },
  state() {
    return {
      /**
       * The two choices shown, in order
       * @type {string[]}
       */
      options: OPTIONS,
      /**
       * Index of the currently highlighted choice (0 = Cancel, 1 = Exit)
       * @type {number}
       */
      selectedIndex: 0,
    }
  },
  watch: {
    /**
     * Resets the highlighted choice back to Cancel every time the dialog opens
     * @param {boolean} value - new value of the open prop
     * @returns {void}
     */
    open(value) {
      if (value) this.selectedIndex = 0
    },
  },
  input: {
    /**
     * Moves the highlight to Cancel
     * @returns {void}
     */
    left() {
      if (this.selectedIndex <= 0) return
      this.selectedIndex--
    },
    /**
     * Moves the highlight to Exit
     * @returns {void}
     */
    right() {
      if (this.selectedIndex >= this.options.length - 1) return
      this.selectedIndex++
    },
    /**
     * Confirms the highlighted choice: closes the app if Exit is selected,
     * otherwise just dismisses the dialog
     * @returns {void}
     */
    enter() {
      this.$emit(this.selectedIndex === 1 ? 'app:confirm-exit' : 'app:cancel-exit')
    },
    /**
     * Treats Back the same as choosing Cancel
     * @returns {void}
     */
    back() {
      this.$emit('app:cancel-exit')
    },
  },
})
