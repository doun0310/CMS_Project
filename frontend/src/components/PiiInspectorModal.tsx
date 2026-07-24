import React from 'react'
import { X, ShieldAlert, CheckCircle, AlertTriangle, FileText } from 'lucide-react'

interface Props {
  isOpen: boolean
  documentName: string
  onClose: () => void
}

export const PiiInspectorModal: React.FC<Props> = ({ isOpen, documentName, onClose }) => {
  if (!isOpen) return null

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
          <ShieldAlert color="#ef4444" size={24} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>AI 개인정보(PII) 문서 정밀 검사</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>문서 내 기밀 문구 및 개인 식별 정보 탐지 결과</p>
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f8fafc', fontWeight: 600 }}>
            <FileText size={16} color="#38bdf8" /> {documentName}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '8px', fontSize: '12px' }}>
            <div style={{ color: '#f87171', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={14} /> 계좌번호 (ACCOUNT_NUMBER) 탐지됨 - 1Page
            </div>
            <div style={{ color: '#cbd5e1', fontFamily: 'monospace', background: '#0f172a', padding: '6px 8px', borderRadius: '4px', marginTop: '4px' }}>
              "입금 계좌: 신한은행 110-***-128491 (예금주: 주식회사 엔론)"
            </div>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '12px', borderRadius: '8px', fontSize: '12px' }}>
            <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={14} /> 기밀 등급 표시 (CONFIDENTIAL_STAMP) - 전체 지면
            </div>
            <div style={{ color: '#cbd5e1', marginTop: '2px' }}>
              문서 헤더 영역에 [STRICTLY CONFIDENTIAL] 워터마크 마킹 확인
            </div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px', background: 'rgba(15, 23, 42, 0.4)', padding: '10px', borderRadius: '6px' }}>
          💡 <strong>결재자 지침:</strong> 본 문서는 PII가 포함되어 있으므로 부서장 최종 승인 후, 실시간 동기화 보안 워터마크가 강제 주입되어 출력됩니다.
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', background: '#10b981', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <CheckCircle size={14} /> PII 검사 확인 완료
          </button>
        </div>
      </div>
    </div>
  )
}
