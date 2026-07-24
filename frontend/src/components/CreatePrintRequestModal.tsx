import React, { useState } from 'react'
import { X, FileText, Send } from 'lucide-react'

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
  const [submitting, setSubmitting] = useState(false)

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
        }),
      })

      const newReq = {
        id: `PR-2026-${Math.floor(100 + Math.random() * 900)}`,
        documentName,
        pageCount: Number(pageCount),
        copyCount: Number(copyCount),
        securityLevel,
        status: 'PENDING',
        requesterName: '현재 임직원 (김민수)',
        requesterDepartment: '재무회계팀',
        createdAt: new Date().toLocaleString(),
      }

      onSuccess(newReq)
      onClose()
    } catch {
      onClose()
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
      <div className="glass-card" style={{ width: '480px', padding: '24px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FileText color="#38bdf8" size={22} />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>신규 인쇄 승인 신청</h3>
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
