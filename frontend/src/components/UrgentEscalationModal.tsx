import React, { useState } from 'react'
import { X, AlertTriangle, Send, BellRing } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (msg: string) => void
}

export const UrgentEscalationModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedRequestId, setSelectedRequestId] = useState('REQ-88192')
  const [targetChannel, setTargetChannel] = useState('SLACK_AND_SMS')
  const [urgentReason, setUrgentReason] = useState('16:00 이사회 보고서 출력용 - 팀장님 긴급 승인 부탁드립니다.')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      onSuccess(`[${selectedRequestId}] 요청에 대한 긴급 에스컬레이션 알림이 담당 승인권자에게 전송되었습니다.`)
      setSubmitting(false)
      onClose()
    }, 500)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="glass-card" style={{ width: '480px', padding: '24px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <AlertTriangle color="#ef4444" size={24} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>인쇄 요청 긴급 승인 에스컬레이션</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>결재 지연 건에 대한 담당 부서장 푸시 알림 발송</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>지연 결재 대상 문서</label>
            <select
              value={selectedRequestId}
              onChange={(e) => setSelectedRequestId(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
            >
              <option value="REQ-88192">REQ-88192: 2026 3분기 재무 보고서 (대외비)</option>
              <option value="REQ-88193">REQ-88193: 사내 네트워크 보안 가이드라인 (일반)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>알림 전송 채널 지정</label>
            <select
              value={targetChannel}
              onChange={(e) => setTargetChannel(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
            >
              <option value="SLACK_AND_SMS">슬랙(Slack) 워크스페이스 + 긴급 SMS</option>
              <option value="KAKAO_ALIMTALK">카카오톡 알림톡 (승인자 휴대폰)</option>
              <option value="EMAIL_HIGH_PRIORITY">사내 이메일 (High-Priority Flag)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>긴급 사유 작성</label>
            <textarea
              rows={3}
              value={urgentReason}
              onChange={(e) => setUrgentReason(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', background: '#334155', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: '8px 16px', background: '#ef4444', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Send size={14} /> {submitting ? '발송 중...' : '🚨 긴급 에스컬레이션 전송'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
