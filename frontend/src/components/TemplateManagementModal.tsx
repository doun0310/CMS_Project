import React, { useState } from 'react'
import { X, FileCode, Upload, Save, CheckCircle } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (msg: string) => void
}

export const TemplateManagementModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [templateName, setTemplateName] = useState('')
  const [category, setCategory] = useState('FINANCE')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      onSuccess(`신규 표준 문서 서식("${templateName}")이 사내 템플릿 저장소에 등록되었습니다.`)
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
          <FileCode color="#38bdf8" size={24} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>신규 사내 문서 서식 템플릿 등록</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>임직원 공용 표준 양식 문서 등록 및 버전 관리</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>서식 템플릿 명칭</label>
            <input
              type="text"
              required
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="예: 2026 하반기 사업계획서 표준 양식 (v2.1)"
              style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>문서 분류 카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
            >
              <option value="FINANCE">재무 / 회계 양식</option>
              <option value="PLANNING">경영 / 기획 템플릿</option>
              <option value="SECURITY">보안 / 약정 서약서</option>
              <option value="HR">인사 / 노무 양식</option>
            </select>
          </div>

          <div style={{ background: '#0f172a', border: '1px dashed #475569', borderRadius: '8px', padding: '20px', textAlign: 'center', cursor: 'pointer' }}>
            <Upload size={24} color="#38bdf8" style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>서식 파일 (.docx, .pdf, .hwp) 드래그 및 업로드</div>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>최대 파일 용량 50MB 이내</div>
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
              <Save size={14} /> {submitting ? '등록 중...' : '서식 등록 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
