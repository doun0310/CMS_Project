import { useEffect, useRef } from 'react'

/**
 * 실시간 상태 갱신을 위한 커스텀 훅 (Interval Polling & Window Focus Auto Refresh)
 */
export function useRealtimeSync(
  callback: () => void | Promise<void>,
  intervalMs: number = 10000,
  enabled: boolean = true,
) {
  const savedCallback = useRef(callback)
  const inFlightRef = useRef(false)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const tick = async () => {
      if (inFlightRef.current) return

      inFlightRef.current = true
      try {
        await savedCallback.current()
      } finally {
        inFlightRef.current = false
      }
    }

    const timer = setInterval(tick, intervalMs)

    const handleFocus = () => {
      void tick()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', handleFocus)
    }
  }, [intervalMs, enabled])
}
