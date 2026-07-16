import Blits from '@lightningjs/blits'
import Navbar from './components/Navbar.js'
import LoadingScreen from './components/LoadingScreen.js'
import PerfHud from './components/PerfHud.js'
import Home from './pages/Home.js'
import Movies from './pages/Movies.js'
import Shows from './pages/Shows.js'
import Sports from './pages/Sports.js'

const BOOT_DELAY = 600

// Tab pages keep their state (scroll position, selected cards) alive when
// switching away, and never steal focus from the Navbar automatically -
// the Navbar explicitly hands focus off to the page content on Down/Enter.
const TAB_ROUTE_OPTIONS = {
  passFocus: false,
  inHistory: false,
  keepAlive: true,
  reuseComponent: false,
}

// Note: template values are hardcoded literals - see components/FocusBorder.js for why.

export default Blits.Application({
  components: {
    Navbar,
    LoadingScreen,
    PerfHud,
  },
  template: `
    <Element w="1920" h="1080" color="#0B0B0B">
      <RouterView ref="router" w="1920" h="1080" />
      <Navbar ref="navbar" />
      <LoadingScreen :show="$loading" />
      <PerfHud />
    </Element>
  `,
  routes: [
    { path: '/', component: Home, options: TAB_ROUTE_OPTIONS },
    { path: '/movies', component: Movies, options: TAB_ROUTE_OPTIONS },
    { path: '/shows', component: Shows, options: TAB_ROUTE_OPTIONS },
    { path: '/sports', component: Sports, options: TAB_ROUTE_OPTIONS },
  ],
  state() {
    return {
      /**
       * Whether the boot loading screen should still be shown
       * @type {boolean}
       */
      loading: true,
    }
  },
  hooks: {
    /**
     * Registers the focus handoff listener from pages back to the Navbar, shows
     * the boot splash briefly, then gives the Navbar initial focus
     * @returns {void}
     */
    ready() {
      this.$listen('nav:focus-navbar', () => this.focusNavbar())
      this.$setTimeout(() => {
        this.loading = false
        this.focusNavbar()
      }, BOOT_DELAY)
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
  },
})
