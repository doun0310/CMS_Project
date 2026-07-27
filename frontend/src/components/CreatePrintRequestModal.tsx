import React, { useState, useEffect } from 'react'
import { X, FileText, Send, ShieldAlert, ShieldCheck } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newRequest: any) => void
}

export const CreatePrintRequestModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [documentName, setDocumentName] = useState('')
  const [documentType, setDocumentType] = useState('GENERAL_DOC')
  const [pageCount, setPageCount] = useState(10)
  const [copyCount, setCopyCount] = useState(1)
  const [securityLevel, setSecurityLevel] = useState('CONFIDENTIAL')
  const [documentContent, setDocumentContent] = useState('')
  const [piiAnalysis, setPiiAnalysis] = useState<{ hasPII: boolean; detectedTypes: string[]; maskedText?: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Real-time PII Analysis on documentContent input
  useEffect(() => {
    if (!documentContent.trim()) {
      setPiiAnalysis(null)
      return
    }

    const timer = setTimeout(() => {
      fetch('/api/v1/print-requests/analyze-pii', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: documentContent }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.data) {
            setPiiAnalysis(data.data)
            if (data.data.hasPII) {
              setSecurityLevel('CONFIDENTIAL')
            }
          }
        })
        .catch(() => null)
    }, 250)

    return () => clearTimeout(timer)
  }, [documentContent])

  if (!isOpen) return null

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!documentName.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/v1/print-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          sourceDocumentId: `DOC-${Date.now()}`,
          templateId: 1,
          copies: Number(copyCount),
          pages: Number(pageCount),
          documentName,
          securityLevel,
          documentContent,
          isSensitive: piiAnalysis?.hasPII || securityLevel === 'CONFIDENTIAL',
        }),
      })
      const body = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(body?.message || '인쇄 요청 등록에 실패했습니다.')
      }

      const newReq = {
        id: String(body?.data?.id || body?.data?.requestNo),
        documentName,
        pageCount: Number(pageCount),
        copyCount: Number(copyCount),
        securityLevel,
        status: 'PENDING',
        requesterName: '현재 임직원 (김민수)',
        requesterDepartment: '재무회계팀',
        piiDetected: piiAnalysis?.hasPII || false,
        createdAt: new Date().toLocaleString(),
      }

      onSuccess(newReq)
      onClose()
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '인쇄 요청 등록에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
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
      <div className="glass-card" style={{ width: '520px', padding: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FileText color="#38bdf8" size={22} />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>신규 인쇄 승인 신청 (AI PII 검출 연동)</h3>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>문서 파일명</label>
            <input
              type="text"
              required
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="예: 2026_신규_사업계획서.pdf"
              style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>문서 본문 / 신청 사유 (실시간 PII 자동 감지)</label>
            <textarea
              rows={3}
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              placeholder="문서 내용이나 사유를 입력하시면 개인정보(주민번호/카드/전화번호)가 실시간으로 자동 감지됩니다."
              style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px', resize: 'vertical' }}
            />
            {piiAnalysis && piiAnalysis.hasPII && (
              <div style={{ marginTop: '6px', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '6px', color: '#fca5a5', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert size={16} color="#ef4444" />
                <span><strong>[AI PII 경고]</strong> 개인정보({piiAnalysis.detectedTypes.join(', ')}) 감지 ➔ 부서장(MANAGER) 승인 자동 지정</span>
              </div>
            )}
            {piiAnalysis && !piiAnalysis.hasPII && documentContent.trim() && (
              <div style={{ marginTop: '6px', padding: '6px 12px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '6px', color: '#86efac', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#22c55e" />
                <span>개인정보 미감지 (일반 승인 가능)</span>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>문서 유형</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
              >
                <option value="GENERAL_DOC">일반 문서</option>
                <option value="FINANCIAL_REPORT">재무 보고서</option>
                <option value="ARCHITECTURE_SPEC">기술 아키텍처</option>
                <option value="HR_EVALUATION">인사 평가서</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>보안 등급</label>
              <select
                value={securityLevel}
                onChange={(e) => setSecurityLevel(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
              >
                <option value="PUBLIC">PUBLIC (일반)</option>
                <option value="RESTRICTED">RESTRICTED (대외비)</option>
                <option value="CONFIDENTIAL">CONFIDENTIAL (극비)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>페이지 수</label>
              <input
                type="number"
                min={1}
                value={pageCount}
                onChange={(e) => setPageCount(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>출력 부수</label>
              <input
                type="number"
                min={1}
                value={copyCount}
                onChange={(e) => setCopyCount(Number(e.target.value))}
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-md btn-secondary"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-md btn-primary"
            >
              <Send size={14} /> {submitting ? '신청 중...' : '인쇄 승인 신청'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
