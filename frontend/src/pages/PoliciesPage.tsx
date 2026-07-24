import React, { useState } from 'react'
import { WatermarkModal } from '../components/WatermarkModal'
import { MediaControlModal } from '../components/MediaControlModal'
import { MultiStageApprovalModal } from '../components/MultiStageApprovalModal'
import { useTranslation } from '../hooks/useTranslation'
import { ShieldCheck, Plus, CheckCircle, AlertTriangle, Eye, HardDrive, UserCheck } from 'lucide-react'

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
  const { t } = useTranslation()
  const [policies, setPolicies] = useState(initialPolicies)
  const [isWatermarkModalOpen, setIsWatermarkModalOpen] = useState(false)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [isMultiStageModalOpen, setIsMultiStageModalOpen] = useState(false)
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
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>{t('policies_title')}</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>{t('policies_sub')}</p>
          {message && <p style={{ color: '#38bdf8', fontSize: '13px', marginTop: '4px' }}>{message}</p>}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsMultiStageModalOpen(true)}
            style={{ padding: '8px 14px', background: '#059669', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <UserCheck size={14} /> {t('btn_zerotrust')}
          </button>
          <button
            onClick={() => setIsMediaModalOpen(true)}
            style={{ padding: '8px 14px', background: '#f59e0b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <HardDrive size={14} /> {t('btn_usb_control')}
          </button>
          <button
            onClick={() => setIsWatermarkModalOpen(true)}
            className="btn btn-md btn-primary"
          >
            <Eye size={14} /> {t('btn_watermark')}
          </button>
        </div>
      </div>

      <MultiStageApprovalModal
        isOpen={isMultiStageModalOpen}
        onClose={() => setIsMultiStageModalOpen(false)}
        onSuccess={(msg) => setMessage(msg)}
      />

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
