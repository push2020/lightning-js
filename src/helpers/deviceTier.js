/**
 * Low-quality device tier configuration: Blits launch settings, source image
 * resolution, and virtualization window buffer sizes. Used for all devices to
 * cap rendering at 30fps and limit concurrently mounted nodes, avoiding the
 * need for per-device detection.
 */
export const TIER = {
  launch: {
    renderQuality: 'low', // simplest shader/texture path, cheapest to render
    maxFPS: 60, // caps render loop to halve GPU/CPU work per second
    viewportMargin: 100, // px outside viewport still considered "visible" for preloading
    // Renderer texture memory budget: stay under 120MB, start evicting at 70%,
    // sweep every 3s, and enforce the cap strictly (never overshoot) for constrained devices
    gpuMemory: { max: 120e6, target: 0.7, cleanupInterval: 3000, strict: true },
  },
  images: { posterW: 180, posterH: 270, landscapeW: 320, landscapeH: 180, heroW: 1280, heroH: 586 }, // low-res source images to keep decode/memory cost low
  window: { visibleCards: 7, cardBuffer: 1, railBufferUp: 1, railBufferDown: 1, railVisibleRows: 3, heroNeighbors: 1 }, // small virtualization buffers to limit concurrently mounted nodes
}

/**
 * High-quality device tier configuration: Blits launch settings, source image
 * resolution, and virtualization window buffer sizes. Kept for reference /
 * a future opt-in path (e.g. a settings toggle or query param) but not
 * currently used — the app renders at the low tier for all devices.
 */
const HIGH_TIER = {
  launch: {
    renderQuality: 'high', // full shader/texture fidelity
    maxFPS: 60, // smooth scrolling/animation on capable hardware
    viewportMargin: 300, // preload further ahead since memory headroom is larger
    // Renderer texture memory budget: allow up to 350MB, start evicting at 85%,
    // sweep every 5s, and allow brief overshoot before enforcing the cap
    gpuMemory: { max: 350e6, target: 0.85, cleanupInterval: 5000, strict: false },
  },
  images: { posterW: 260, posterH: 390, landscapeW: 460, landscapeH: 259, heroW: 1920, heroH: 880 }, // high-res source images for sharper rendering
  window: { visibleCards: 8, cardBuffer: 4, railBufferUp: 2, railBufferDown: 3, railVisibleRows: 3, heroNeighbors: 1 }, // larger virtualization buffers for smoother scroll-ahead
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
