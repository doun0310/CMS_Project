import React, { useState } from 'react'
import { X, ShieldCheck, UserCheck, ArrowRight, Save } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (msg: string) => void
}

export const MultiStageApprovalModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [requireSecondStage, setRequireSecondStage] = useState(true)
  const [secondStageApprover, setSecondStageApprover] = useState('CISO_SECURITY_TEAM')
  const [delegateApprover, setDelegateApprover] = useState('DEPUTY_MANAGER_KIM')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      onSuccess('Zero-Trust 기반 다단계 승인 결재선 및 대리 결재자 설정이 저장되었습니다.')
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
      <div className="glass-card" style={{ width: '500px', padding: '24px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <ShieldCheck color="#38bdf8" size={24} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Zero-Trust 다단계 결재선 & 대리 결재</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>대외비 문구 문서 2단계 승인 및 부재시 위임 설정</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Approval Workflow Preview */}
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-around', fontSize: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#38bdf8', fontWeight: 700 }}>1차 결재선</div>
              <div style={{ color: '#cbd5e1', fontSize: '11px' }}>소속 부서장</div>
            </div>
            <ArrowRight size={16} color="#64748b" />
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: requireSecondStage ? '#34d399' : '#64748b', fontWeight: 700 }}>2차 최종 승인</div>
              <div style={{ color: '#cbd5e1', fontSize: '11px' }}>{secondStageApprover === 'CISO_SECURITY_TEAM' ? 'CISO 보안팀' : '최고경영진'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#e2e8f0', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={requireSecondStage}
                onChange={(e) => setRequireSecondStage(e.target.checked)}
              />
              <div>
                <strong style={{ color: '#fff' }}>대외비(CONFIDENTIAL) 문서 2단계 최종 승인 강제</strong>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>1차 부서장 승인 후 보안관리자 2차 승인 필요</p>
              </div>
            </label>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>2차 승인 담당 조직</label>
              <select
                value={secondStageApprover}
                onChange={(e) => setSecondStageApprover(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
              >
                <option value="CISO_SECURITY_TEAM">정보보안실 CISO 파트</option>
                <option value="EXECUTIVE_OFFICE">경영기획실 임원진</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>부서장 부재 시 대리 결재자 (Delegated Approver)</label>
              <select
                value={delegateApprover}
                onChange={(e) => setDelegateApprover(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
              >
                <option value="DEPUTY_MANAGER_KIM">김철수 차장 (부서 대리 결재자)</option>
                <option value="DEPUTY_MANAGER_PARK">박영희 수석연구원</option>
              </select>
            </div>
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
              <Save size={14} /> {submitting ? '저장 중...' : '다단계 결재선 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
