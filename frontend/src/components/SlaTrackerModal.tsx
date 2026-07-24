import React, { useState } from 'react'
import { X, ShieldCheck, Wrench, Calendar, Clock, FileText, CheckCircle } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (msg: string) => void
}

export const SlaTrackerModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleRequestService = () => {
    setSubmitting(true)
    setTimeout(() => {
      onSuccess('한국제록스 공식 렌탈 유지보수 엔지니어 긴급 방문 접수가 완료되었습니다. (접수번호: SLA-2026-9912)')
      setSubmitting(false)
      onClose()
    }, 500)
  }

  const slaContracts = [
    { id: 'PRT-3F-XR01', name: 'Xerox AltaLink C8055', provider: '한국제록스(주)', expireDate: '2027-12-31', mtbf: '99.94%', lastService: '2026-07-02 (정기점검)' },
    { id: 'PRT-2F-HP01', name: 'HP Color LaserJet M856', provider: 'HP Enterprise Korea', expireDate: '2026-11-30', mtbf: '99.85%', lastService: '2026-06-15 (롤러 교체)' },
    { id: 'PRT-4F-CN01', name: 'Canon imageRUNNER C5560i', provider: '캐논코리아(주)', expireDate: '2028-05-31', mtbf: '100%', lastService: '2026-07-10 (토너 수거)' },
  ]

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
      <div className="glass-card" style={{ width: '620px', padding: '24px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <FileText color="#38bdf8" size={24} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>복합기 렌탈 자산 SLA & 유지보수 계약 관리</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>장비별 보증 기간, 가동률(MTBF) 및 엔지니어 정기 점검 이력</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {slaContracts.map((contract) => (
            <div key={contract.id} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>{contract.name} ({contract.id})</span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>공급업체: {contract.provider}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', color: '#94a3b8', fontSize: '11px', marginTop: '6px' }}>
                <div><Calendar size={11} style={{ display: 'inline', marginRight: '4px' }} /> 계약 만료: <span style={{ color: '#cbd5e1' }}>{contract.expireDate}</span></div>
                <div><Clock size={11} style={{ display: 'inline', marginRight: '4px' }} /> 가동률 SLA: <span style={{ color: '#34d399', fontWeight: 700 }}>{contract.mtbf}</span></div>
                <div><Wrench size={11} style={{ display: 'inline', marginRight: '4px' }} /> 최근 점검: <span style={{ color: '#cbd5e1' }}>{contract.lastService}</span></div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', fontSize: '12px' }}>
          <span style={{ color: '#cbd5e1' }}>장비 장애 발생 시 SLA 계약에 의거 2시간 내 현장 출동 보장</span>
          <button
            onClick={handleRequestService}
            disabled={submitting}
            style={{ padding: '8px 14px', background: '#0284c7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <Wrench size={13} /> {submitting ? '접수 중...' : '🔧 엔지니어 긴급 방문 접수'}
          </button>
        </div>
      </div>
    </div>
  )
}
