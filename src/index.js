import Blits from '@lightningjs/blits'
import App from './App.js'
import { getLaunchSettings } from './helpers/deviceTier.js'
import { detectRefreshRate } from './helpers/refreshRate.js'

/**
 * Detects the TV's actual refresh rate and launches the Blits app capped to
 * it, rather than assuming a fixed 60fps for every device.
 * @returns {Promise<void>} resolves once Blits.Launch has been called
 */
async function start() {
  const maxFPS = await detectRefreshRate()

  Blits.Launch(App, 'app', {
    w: 1920,
    h: 1080,
    debugLevel: 1,
    canvasColor: '#0B0B0B',
    enableMouse: true,
    // renderQuality, viewportMargin and gpuMemory come from the low-end tier
    // config (see helpers/deviceTier.js), used for all devices. maxFPS is
    // measured per-device above instead, since it depends on the actual
    // display refresh rate rather than device tier.
    ...getLaunchSettings(),
    maxFPS,
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
