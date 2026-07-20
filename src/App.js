import Blits from '@lightningjs/blits'
import Navbar from './components/Navbar.js'
import LoadingScreen from './components/LoadingScreen.js'
import PerfHud from './components/PerfHud.js'
import ExitConfirmModal from './components/ExitConfirmModal.js'
import Home from './pages/Home.js'
import Movies from './pages/Movies.js'
import Shows from './pages/Shows.js'
import Sports from './pages/Sports.js'

const BOOT_DELAY = 600

// Tab pages never steal focus from the Navbar automatically - the Navbar
// explicitly hands focus off to the page content on Down/Enter.
//
// keepAlive is intentionally false: the Navbar always navigates with
// $router.to() (never $router.back()), and Blits only restores a cached
// "keepAlive" view through the back-navigation path. With inHistory:false
// too, a kept-alive view was never destroyed AND never reachable again -
// every tab switch orphaned the previous page's view instead of freeing it.
const TAB_ROUTE_OPTIONS = {
  passFocus: false,
  inHistory: false,
  keepAlive: false,
  reuseComponent: false,
}

// Blits' default route transition fades the incoming page's alpha from 0 to
// 1 over 200ms. That means every Text node on the page is first created and
// rasterized while genuinely at alpha 0 (only the very first page loaded at
// boot skips this, since it has no previous route to transition from) - and
// the canvas-based text renderer never recovers once alpha animates back up,
// leaving hero titles/buttons blank while images (whose textures load
// independently of alpha) render fine. Dropping "in" skips that fade-in
// entirely; the "out" fade on the outgoing page is unaffected and kept.
const TAB_TRANSITION = {
  out: { prop: 'alpha', value: 0, duration: 100 },
}

// Note: template values are hardcoded literals - see components/FocusBorder.js for why.

export default Blits.Application({
  components: {
    Navbar,
    LoadingScreen,
    PerfHud,
    ExitConfirmModal,
  },
  template: `
    <Element w="1920" h="1080" color="#0B0B0B">
      <RouterView ref="router" w="1920" h="1080" />
      <Navbar ref="navbar" />
      <LoadingScreen :show="$loading" />
      <PerfHud />
      <ExitConfirmModal ref="exitConfirm" :open="$showExitConfirm" />
    </Element>
  `,
  routes: [
    { path: '/', component: Home, options: TAB_ROUTE_OPTIONS, transition: TAB_TRANSITION },
    { path: '/movies', component: Movies, options: TAB_ROUTE_OPTIONS, transition: TAB_TRANSITION },
    { path: '/shows', component: Shows, options: TAB_ROUTE_OPTIONS, transition: TAB_TRANSITION },
    { path: '/sports', component: Sports, options: TAB_ROUTE_OPTIONS, transition: TAB_TRANSITION },
  ],
  state() {
    return {
      /**
       * Whether the boot loading screen should still be shown
       * @type {boolean}
       */
      loading: true,
      /**
       * Whether the exit-confirmation dialog is currently shown
       * @type {boolean}
       */
      showExitConfirm: false,
    }
  },
  hooks: {
    /**
     * Registers the focus handoff / exit-confirmation listeners, shows the
     * boot splash briefly, then gives the Navbar initial focus
     * @returns {void}
     */
    ready() {
      this.$listen('nav:focus-navbar', () => this.focusNavbar())
      this.$listen('app:confirm-exit', () => this.closeApp())
      this.$listen('app:cancel-exit', () => this.hideExitConfirm())
      this.$setTimeout(() => {
        this.loading = false
        this.focusNavbar()
      }, BOOT_DELAY)
    },
  },
  input: {
    /**
     * Opens the exit-confirmation dialog when Back is pressed at the root
     * level. Content pages already handle Back themselves (returning focus
     * to the Navbar), so this only fires once Back bubbles all the way up -
     * i.e. when the Navbar itself is focused and there's nowhere left to go
     * back to.
     * @returns {void}
     */
    back() {
      this.showExitConfirmDialog()
    },
  },
  methods: {
    /**
     * Focuses the top navigation bar
     * @returns {void}
     */
    focusNavbar() {
      const navbar = this.$select('navbar')
      if (navbar) navbar.$focus()
    },
    /**
     * Shows the exit-confirmation dialog and gives it focus
     * @returns {void}
     */
    showExitConfirmDialog() {
      this.showExitConfirm = true
      const modal = this.$select('exitConfirm')
      if (modal) modal.$focus()
    },
    /**
     * Hides the exit-confirmation dialog and returns focus to the Navbar
     * @returns {void}
     */
    hideExitConfirm() {
      this.showExitConfirm = false
      this.focusNavbar()
    },
    /**
     * Closes the app window. Works when running as (or embedded in) a
     * script-opened/kiosk-style window - e.g. a real TV app runtime - and is
     * a harmless no-op in a regular user-opened desktop browser tab, which
     * browsers block from being closed by script for security reasons.
     * @returns {void}
     */
    closeApp() {
      if (typeof window !== 'undefined' && typeof window.close === 'function') {
        window.close()
      }
    },
  },
})
