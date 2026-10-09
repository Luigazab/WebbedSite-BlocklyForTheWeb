import { useCallback, useEffect, useRef } from 'react'

function measureDeviceFactor() {
  const started = performance.now()
  let checksum = 1
  for (let index = 0; index < 120000; index += 1) checksum = Math.imul(checksum ^ index, 1664525)
  const milliseconds = performance.now() - started + (checksum & 1) * 0.0001
  return Math.max(0.5, Math.min(2, Math.round(milliseconds / 4 * 100) / 100))
}

export function useActivityTiming() {
  const activeSeconds = useRef(0)
  const deviceFactor = useRef(null)
  useEffect(() => {
    deviceFactor.current = measureDeviceFactor()
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') activeSeconds.current += 1
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])
  return useCallback(() => ({
    activeSeconds: activeSeconds.current,
    deviceFactor: deviceFactor.current,
  }), [])
}
