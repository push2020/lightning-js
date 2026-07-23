// How often the displayed FPS value is refreshed (ms)
const FLUSH_MS = 300

/**
 * Starts a requestAnimationFrame sampling loop that measures frames
 * rendered per second over a rolling window and reports the result.
 * @param {(fps: number) => void} onSample - called with the latest FPS value every flushMs
 * @returns {{stop: () => void}} handle to stop the sampling loop
 */
function startFpsMeter(onSample) {
  let last = performance.now()
  let elapsed = 0
  let frames = 0
  let rafId

  const tick = (now) => {
    const dt = now - last
    last = now
    elapsed += dt
    frames += 1

    if (elapsed >= FLUSH_MS) {
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

const fpsElement = document.getElementById('fps')

startFpsMeter((fps) => {
  fpsElement.textContent = fps + ' FPS'
})
