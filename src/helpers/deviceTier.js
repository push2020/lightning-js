const TIER_QUERY_PATTERN = /[?&]tier=(low|mid|high)\b/i

const VIDAA_PATTERN = /VIDAA/i
const TIZEN_PATTERN = /Tizen/i
const MID_TIER_PATTERN = /webOS|Web0S|Android.*TV|AFTM|AFTT|BRAVIA/i

/**
 * Detects the current device's performance tier from the user agent, since
 * neither Blits nor the underlying renderer exposes any GPU/WebGL capability
 * query. A `?tier=low|mid|high` query param overrides detection, so a
 * misidentified TV model can be corrected without a rebuild.
 * @returns {'low'|'mid'|'high'} the detected or overridden device tier
 */
function detectTier() {
  const search = typeof location !== 'undefined' ? location.search : ''
  const override = search.match(TIER_QUERY_PATTERN)
  if (override) return override[1].toLowerCase()

  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
  if (VIDAA_PATTERN.test(userAgent)) return 'low'
  if (TIZEN_PATTERN.test(userAgent)) return 'high'
  if (MID_TIER_PATTERN.test(userAgent)) return 'mid'
  return 'mid'
}

/**
 * The device tier detected once at module load. User agent and query params
 * don't change during a session, so there's no need to re-detect later.
 * @type {'low'|'mid'|'high'}
 */
export const DEVICE_TIER = detectTier()

/**
 * Per-tier configuration: Blits launch settings, source image resolution,
 * and virtualization window buffer sizes. Low tier trades visual fidelity
 * and scroll-ahead smoothness for stability on constrained hardware; high
 * tier keeps full fidelity and larger buffers for smoother scrolling.
 */
const TIER = {
  low: {
    launch: {
      renderQuality: 'low',
      maxFPS: 30,
      viewportMargin: 100,
      gpuMemory: { max: 120e6, target: 0.7, cleanupInterval: 3000, strict: true },
    },
    images: { posterW: 180, posterH: 270, heroW: 1280, heroH: 586 },
    window: { cardBuffer: 2, railBufferUp: 1, railBufferDown: 1, railVisibleRows: 3, heroNeighbors: 1 },
  },
  mid: {
    launch: {
      renderQuality: 'medium',
      maxFPS: 60,
      viewportMargin: 300,
      gpuMemory: { max: 200e6, target: 0.8, cleanupInterval: 5000, strict: false },
    },
    images: { posterW: 220, posterH: 330, heroW: 1600, heroH: 734 },
    window: { cardBuffer: 3, railBufferUp: 1, railBufferDown: 2, railVisibleRows: 3, heroNeighbors: 1 },
  },
  high: {
    launch: {
      renderQuality: 'high',
      maxFPS: 60,
      viewportMargin: 300,
      gpuMemory: { max: 350e6, target: 0.85, cleanupInterval: 5000, strict: false },
    },
    images: { posterW: 260, posterH: 390, heroW: 1920, heroH: 880 },
    window: { cardBuffer: 4, railBufferUp: 2, railBufferDown: 3, railVisibleRows: 3, heroNeighbors: 1 },
  },
}

/**
 * Returns the full tier configuration (launch settings, image sizes, window
 * buffers) for the currently detected device tier.
 * @returns {typeof TIER['low']} the current tier's configuration
 */
export function getTierConfig() {
  return TIER[DEVICE_TIER]
}

/**
 * Returns the Blits.Launch settings object for the currently detected tier.
 * @returns {typeof TIER['low']['launch']} launch settings to spread into Blits.Launch
 */
export function getLaunchSettings() {
  return TIER[DEVICE_TIER].launch
}
