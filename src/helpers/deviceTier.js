/**
 * Single device tier configuration: Blits launch settings, source image
 * resolution, and virtualization window buffer sizes. Low tier settings are
 * used for all devices since they run acceptably on both constrained and
 * high-end hardware, avoiding the need for per-device detection.
 */
const TIER = {
  launch: {
    renderQuality: 'low',
    maxFPS: 30,
    viewportMargin: 100,
    gpuMemory: { max: 120e6, target: 0.7, cleanupInterval: 3000, strict: true },
  },
  images: { posterW: 180, posterH: 270, heroW: 1280, heroH: 586 },
  window: { cardBuffer: 2, railBufferUp: 1, railBufferDown: 1, railVisibleRows: 3, heroNeighbors: 1 },
}

/**
 * Returns the tier configuration (launch settings, image sizes, window
 * buffers) used for all devices.
 * @returns {typeof TIER} the tier configuration
 */
export function getTierConfig() {
  return TIER
}

/**
 * Returns the Blits.Launch settings object.
 * @returns {typeof TIER['launch']} launch settings to spread into Blits.Launch
 */
export function getLaunchSettings() {
  return TIER.launch
}
