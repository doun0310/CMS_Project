import React, { useState } from 'react'
import { WatermarkModal } from '../components/WatermarkModal'
import { MediaControlModal } from '../components/MediaControlModal'
import { ShieldCheck, Plus, CheckCircle, AlertTriangle, Eye, HardDrive } from 'lucide-react'

export const initialPolicies = [
  {
    id: 'POL-1001',
    documentType: 'FINANCIAL_REPORT',
    minCopies: 1,
    requiresManagerApproval: true,
    requiresReprintApproval: true,
    requiresSensitiveApproval: true,
    status: 'ACTIVE',
  },
  {
    id: 'POL-1002',
    documentType: 'ARCHITECTURE_SPEC',
    minCopies: 5,
    requiresManagerApproval: true,
    requiresReprintApproval: false,
    requiresSensitiveApproval: true,
    status: 'ACTIVE',
  },
  {
    id: 'POL-1003',
    documentType: 'PROMOTION_FLYER',
    minCopies: 30,
    requiresManagerApproval: true,
    requiresReprintApproval: true,
    requiresSensitiveApproval: false,
    status: 'ACTIVE',
  },
]

export const PoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState(initialPolicies)
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleWatermarkSuccess = (updatedWatermark: any) => {
    setMessage(`인쇄 지면 동적 워터마크 문구("${updatedWatermark.watermarkText}")가 모든 프린터 출력물에 적용되었습니다.`)
  }

  const handleMediaSuccess = (statusMessage: string) => {
    setMessage(statusMessage)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>인쇄 보안 통제 및 워터마크 설정</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>부서별 문서 결재 승인 규칙 및 출력물 물리 보안 워터마크 제어</p>
          {message && <p style={{ color: '#38bdf8', fontSize: '13px', marginTop: '4px' }}>{message}</p>}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsMediaModalOpen(true)}
            className="btn btn-md btn-warning"
          >
            <HardDrive size={14} /> 💾 외장 매체/USB 보안 통제
          </button>
          <button
            onClick={() => setIsWatermarkModalOpen(true)}
            className="btn btn-md btn-primary"
          >
            <Eye size={14} /> 🖨️ 워터마크 실시간 설정
          </button>
        </div>
      </div>

      <MediaControlModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSuccess={handleMediaSuccess}
      />

      <WatermarkModal
        isOpen={isWatermarkModalOpen}
        onClose={() => setIsWatermarkModalOpen(false)}
        onSuccess={handleWatermarkSuccess}
      />

      <div className="glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>정책 ID</th>
              <th>대상 문서 유형</th>
              <th>최소 승인 부수</th>
              <th>팀장 결재</th>
              <th>재인쇄 통제</th>
              <th>기밀 전수 승인</th>
              <th>정책 상태</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((pol) => (
              <tr key={pol.id}>
                <td style={{ fontWeight: 600, color: '#f59e0b' }}>{pol.id}</td>
                <td style={{ fontWeight: 600 }}>{pol.documentType}</td>
                <td>
                  <span style={{ color: '#38bdf8', fontWeight: 600 }}>{pol.minCopies} 부 이상</span>
                </td>
                <td>
                  {pol.requiresManagerApproval ? (
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <CheckCircle size={14} /> 필수
                    </span>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '12px' }}>미적용</span>
                  )}
                </td>
                <td>
                  {pol.requiresReprintApproval ? (
                    <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <AlertTriangle size={14} /> 승인 필요
                    </span>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '12px' }}>자율</span>
                  )}
                </td>
                <td>
                  {pol.requiresSensitiveApproval ? (
                    <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                      <ShieldCheck size={14} /> 통제
                    </span>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '12px' }}>해당없음</span>
                  )}
                </td>
                <td>
                  <span className="badge badge-active">{pol.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
