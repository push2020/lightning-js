// How often a started meter reports its latest sample (ms)
const FLUSH_MS = 300

/**
 * Starts an independent requestAnimationFrame sampling loop (separate from
 * Blits' internal render loop) that measures, over a rolling FLUSH_MS
 * window:
 *  - fps: frames actually rendered per second in that window.
 *  - frameTime: average wall-clock time per frame (ms), including any idle
 *    time spent waiting for vsync.
 *  - workTime: average main-thread busy time per frame (ms) - script +
 *    layout + paint - approximated with the "post a task at frame start"
 *    trick: a MessageChannel message posted at the start of the rAF callback
 *    is only delivered after the browser finishes that frame's rendering
 *    work, so (deliveredAt - frameStart) is roughly the busy time.
 * @param {(sample: {fps: number, frameTime: string, workTime: string}) => void} onSample - called with the latest sample every flushMs
 * @param {number} [flushMs] - how often to report a sample, in ms
 * @returns {{stop: () => void}} handle to stop the sampling loop
 */
export function startFpsMeter(onSample, flushMs = FLUSH_MS) {
  let last = performance.now()
  let fpsMs = 0
  let workSum = 0
  let fpsN = 0
  let fpsClock = last
  let frameStart = 0
  let lastWork = 0
  let rafId

  const channel = new MessageChannel()
  channel.port1.onmessage = () => {
    lastWork = performance.now() - frameStart
  }

  const tick = (now) => {
    const dt = now - last
    last = now
    frameStart = now

    fpsMs += dt
    workSum += lastWork
    fpsN += 1

    if (now - fpsClock > flushMs) {
      const avgFrame = fpsMs / fpsN
      onSample({
        fps: Math.round(1000 / avgFrame),
        frameTime: avgFrame.toFixed(1),
        workTime: (workSum / fpsN).toFixed(1),
      })
      fpsMs = 0
      workSum = 0
      fpsN = 0
      fpsClock = now
    }

    // Measure when this frame's main-thread work actually ends.
    channel.port2.postMessage(null)
    rafId = requestAnimationFrame(tick)
  }

  rafId = requestAnimationFrame(tick)

  return {
    stop() {
      cancelAnimationFrame(rafId)
      channel.port1.onmessage = null
    },
  }
}
