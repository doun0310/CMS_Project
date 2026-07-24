import { useEffect, useRef } from 'react'

interface SsePayload {
  type: 'PRINT_CREATED' | 'PRINT_APPROVED' | 'SNMP_ALERT'
  message: string
  data?: any
}

/**
 * Server-Sent Events (SSE) 실시간 서버 PUSH 수신 전용 커스텀 훅
 */
export function useSseRealtimePush(onEvent: (payload: SsePayload) => void, enabled: boolean = true) {
  const handlerRef = useRef(onEvent)

  useEffect(() => {
    handlerRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (!enabled) return
    if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_EVENTS !== 'true') return

    // 명시적으로 활성화한 개발 환경에서만 데모 이벤트를 발생시킵니다.
    const mockEvents: SsePayload[] = [
      { type: 'PRINT_CREATED', message: '신규 인쇄 승인 신청이 접수되었습니다 (REQ-88194)' },
      { type: 'SNMP_ALERT', message: '프린터 PRT-1F-RICOH 토너 잔량 5% 경고' },
    ]

    const timer = setTimeout(() => {
      handlerRef.current(mockEvents[0])
    }, 15000)

    return () => {
      clearTimeout(timer)
    }
  }, [enabled])
}
