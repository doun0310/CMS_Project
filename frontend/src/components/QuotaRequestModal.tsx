import React, { useState } from 'react'
import { X, PieChart, Plus, Send, CheckCircle } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (msg: string) => void
}

export const QuotaRequestModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [requestedAmount, setRequestedAmount] = useState('100')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      onSuccess(`인쇄 쿼터 ${requestedAmount}장 추가 한도 신청이 완료되어 팀장 승인 결재함으로 전송되었습니다.`)
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
          <PieChart color="#38bdf8" size={24} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>월간 인쇄 쿼터 추가 한도 신청</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>프로젝트 수행 및 긴급 출력을 위한 쿼터 증설 요청</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
              <span>현재 사용량: <strong>480장 / 500장</strong></span>
              <span style={{ color: '#f59e0b', fontWeight: 700 }}>잔여: 20장 (96% 소진)</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>증설 희망 쿼터 수량</label>
            <select
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
            >
              <option value="100">+100장 (소형 프로젝트용)</option>
              <option value="200">+200장 (분기 실적 발표용)</option>
              <option value="500">+500장 (대규모 서식 인쇄용)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>증설 신청 사유</label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="쿼터 증설이 필요한 업무 목적을 기술하세요 (예: 3분기 이사회 보고서 제본 인쇄)"
              style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px', resize: 'none' }}
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
              style={{ padding: '8px 16px', background: '#0284c7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Send size={14} /> {submitting ? '신청 중...' : '쿼터 증설 신청 전송'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
