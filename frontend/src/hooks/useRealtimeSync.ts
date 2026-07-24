import { useEffect, useRef } from 'react'

/**
 * 실시간 상태 갱신을 위한 커스텀 훅 (Interval Polling & Window Focus Auto Refresh)
 */
export function useRealtimeSync(callback: () => void, intervalMs: number = 10000, enabled: boolean = true) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!enabled) return

    const tick = () => {
      savedCallback.current()
    }

    const timer = setInterval(tick, intervalMs)

    const handleFocus = () => {
      savedCallback.current()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', handleFocus)
    }
  }, [intervalMs, enabled])
}
