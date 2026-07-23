import Blits from '@lightningjs/blits'
import App from './App.js'

/**
 * Launches the Blits app with no FPS cap, so the on-screen counter reflects
 * the display's true, uncapped rendering rate.
 * @returns {void}
 */
function start() {
  Blits.Launch(App, 'app', {
    w: 1920,
    h: 1080,
    debugLevel: 1,
    canvasColor: '#0B0B0B',
    enableMouse: true,
    // Keyboard Backspace (8) and Escape (27) already map to 'back' by default.
    // These add the dedicated hardware Back button's keyCode on common TV
    // remotes, which differs by platform, so Back works on a real remote too.
    keymap: {
      461: 'back', // LG webOS
      10009: 'back', // Samsung Tizen
      4: 'back', // Android TV
    },
    // No custom fonts registered - Text falls back to the renderer's built-in
    // default (sans-serif), avoiding all custom font loading (MSDF/WebGL atlas
    // and the FontFace/canvas path alike) for maximum device compatibility.
  })
}

start()
