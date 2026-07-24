import React, { useState } from 'react'
import { TemplateManagementModal } from '../components/TemplateManagementModal'
import { useTranslation } from '../hooks/useTranslation'
import { FileCode, Plus, Download, Printer, CheckCircle } from 'lucide-react'

export const TemplatesPage: React.FC = () => {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const templates = [
    { id: 'TPL-001', name: '2026 사업계획서 기획 템플릿', category: 'PLANNING', version: 'v2.1', downloads: 142 },
    { id: 'TPL-002', name: '지출 결의서 표준 서식', category: 'FINANCE', version: 'v1.4', downloads: 389 },
    { id: 'TPL-003', name: '정보보안 서약서 (NDA)', category: 'SECURITY', version: 'v3.0', downloads: 512 },
    { id: 'TPL-004', name: '근로 계약서 공용 서식', category: 'HR', version: 'v1.2', downloads: 98 },
  ]

  const handleDownload = (name: string) => {
    setMessage(`서식 템플릿("${name}") 파일이 성공적으로 다운로드되었습니다.`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>사내 문서 서식 템플릿 저장소</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>임직원 공용 표준 결재 서식 양식 관리 및 바로 인쇄 연결</p>
          {message && <p style={{ color: '#38bdf8', fontSize: '13px', marginTop: '4px' }}>{message}</p>}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-md btn-primary"
        >
          <Plus size={16} /> 신규 서식 템플릿 등록
        </button>
      </div>

      <TemplateManagementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(msg) => setMessage(msg)}
      />

      <div className="glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>서식 ID</th>
              <th>서식 템플릿 명칭</th>
              <th>카테고리</th>
              <th>버전</th>
              <th>다운로드 수</th>
              <th>작업</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((tpl) => (
              <tr key={tpl.id}>
                <td style={{ fontWeight: 600, color: '#38bdf8' }}>{tpl.id}</td>
                <td style={{ fontWeight: 600 }}>{tpl.name}</td>
                <td>
                  <span className="badge badge-approved">{tpl.category}</span>
                </td>
                <td style={{ color: '#cbd5e1' }}>{tpl.version}</td>
                <td style={{ color: '#94a3b8' }}>{tpl.downloads}회</td>
                <td>
                  <button
                    onClick={() => handleDownload(tpl.name)}
                    className="btn btn-sm btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Download size={12} /> 다운로드
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
