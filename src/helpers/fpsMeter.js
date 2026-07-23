// How often a started meter reports its latest fps sample (ms)
const FLUSH_MS = 300

/**
 * Starts a requestAnimationFrame sampling loop that measures frames actually
 * rendered per second, averaged over a rolling FLUSH_MS window.
 * @param {(fps: number) => void} onSample - called with the latest fps value every flushMs
 * @param {number} [flushMs] - how often to report a sample, in ms
 * @returns {{stop: () => void}} handle to stop the sampling loop
 */
export function startFpsMeter(onSample, flushMs = FLUSH_MS) {
  let last = performance.now()
  let elapsed = 0
  let frames = 0
  let rafId

  const tick = (now) => {
    elapsed += now - last
    last = now
    frames += 1

    if (elapsed >= flushMs) {
      onSample(Math.round((frames * 1000) / elapsed))
      elapsed = 0
      frames = 0
    }

    rafId = requestAnimationFrame(tick)
  }

  rafId = requestAnimationFrame(tick)

  return {
    stop() {
      cancelAnimationFrame(rafId)
    },
  }
}
