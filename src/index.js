import Blits from '@lightningjs/blits'
import App from './App.js'
import { COLORS } from './constants/theme.js'

Blits.Launch(App, 'app', {
  w: 1920,
  h: 1080,
  debugLevel: 1,
  defaultFont: 'opensans',
  canvasColor: COLORS.background,
  enableMouse: true,
  viewportMargin: 300,
  // Keyboard Backspace (8) and Escape (27) already map to 'back' by default.
  // These add the dedicated hardware Back button's keyCode on common TV
  // remotes, which differs by platform, so Back works on a real remote too.
  keymap: {
    461: 'back', // LG webOS
    10009: 'back', // Samsung Tizen
    4: 'back', // Android TV
  },
  // A single web-type font used everywhere (see components/Navbar.js's Back
  // key handling / Tizen font notes) - avoids the WebGL MSDF/SDF text shader
  // path entirely, which is more broadly compatible across TV platforms.
  fonts: [
    {
      family: 'opensans',
      type: 'web',
      file: 'fonts/OpenSans-Medium.ttf',
    },
  ],
})
