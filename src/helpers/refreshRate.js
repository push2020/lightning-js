// Common display refresh rates (Hz) that TVs and monitors actually run at.
const REFRESH_RATE_CANDIDATES = [24, 25, 30, 48, 50, 60, 90, 120]

// How long to sample native requestAnimationFrame timing before launch (ms).
const DEFAULT_SAMPLE_MS = 500

// Used if sampling produces too few frames to be a reliable reading.
const DEFAULT_FALLBACK_FPS = 60

/**
 * Rounds a raw measured fps value to the nearest common display refresh
 * rate, so jitter in the sample doesn't produce an odd cap like 58 or 63.
 * @param {number} measuredFps - raw measured frames-per-second value
 * @returns {number} closest matching rate from REFRESH_RATE_CANDIDATES
 */
function roundToNearestRefreshRate(measuredFps) {
  return REFRESH_RATE_CANDIDATES.reduce((closest, candidate) =>
    Math.abs(candidate - measuredFps) < Math.abs(closest - measuredFps) ? candidate : closest
  )
}

/**
 * Measures the display's actual refresh cadence by sampling native,
 * unthrottled requestAnimationFrame timing for a short window before the
 * app starts rendering. This runs ahead of any Blits render-loop throttling,
 * so it reflects what the TV/browser can actually deliver rather than a
 * hardcoded per-device guess.
 * @param {{sampleMs?: number, fallbackFps?: number}} [options] - sampling window length and fallback if the sample is unreliable
 * @returns {Promise<number>} detected (or fallback) refresh rate in fps
 */
export function detectRefreshRate({ sampleMs = DEFAULT_SAMPLE_MS, fallbackFps = DEFAULT_FALLBACK_FPS } = {}) {
  return new Promise((resolve) => {
    const start = performance.now()
    let last = start
    let total = 0
    let count = 0

    const tick = (now) => {
      total += now - last
      last = now
      count += 1

      if (now - start < sampleMs) {
        requestAnimationFrame(tick)
        return
      }

      if (count < 2) {
        resolve(fallbackFps)
        return
      }

      resolve(roundToNearestRefreshRate(1000 / (total / count)))
    }

    requestAnimationFrame(tick)
  })
}
