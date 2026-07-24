import React from 'react'
import { X, FileText, CheckCircle2, ShieldCheck, ArrowRightLeft } from 'lucide-react'

interface Props {
  isOpen: boolean
  documentName: string
  onClose: () => void
}

export const DocumentComparisonModal: React.FC<Props> = ({ isOpen, documentName, onClose }) => {
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
      <div className="glass-card" style={{ width: '720px', padding: '24px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <ArrowRightLeft color="#38bdf8" size={24} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>출력물 원본 vs 스캔본 위변조 검증</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>신청 디지털 원본과 프린터실 물리 출력 스캔본 대조 분석</p>
          </div>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#f8fafc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} color="#38bdf8" /> {documentName}
          </span>
          <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> 위변조 무결성 일치율 100% (MATCH)
          </span>
        </div>

        {/* Side by Side Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {/* Left: Original Digital File */}
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', height: '260px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #1e293b' }}>
              📄 1. 전자 결재 디지털 원본 (PDF)
            </div>
            <div style={{ flex: 1, background: '#ffffff', color: '#000', padding: '12px', fontSize: '10px', fontFamily: 'serif', borderRadius: '4px', overflow: 'hidden', opacity: 0.9 }}>
              <h4 style={{ fontSize: '12px', textDecoration: 'underline', marginBottom: '8px' }}>[신청서] 2026 3분기 재무 보고서</h4>
              <p>본 문서는 경영지원실 엄격 보안 서식입니다.</p>
              <p style={{ marginTop: '6px' }}>총 발행 수량: 10부 / 결재자: 이동현 팀장</p>
            </div>
          </div>

          {/* Right: Printed Scan Copy with Watermark & Barcode */}
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', height: '260px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600, marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #1e293b' }}>
              🖨️ 2. 프린터 실물 출력 스캔본 (보안 마킹)
            </div>
            <div style={{ flex: 1, background: '#ffffff', color: '#000', padding: '12px', fontSize: '10px', fontFamily: 'serif', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
              {/* Dynamic Watermark Overlay */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', color: 'rgba(239, 68, 68, 0.25)', fontSize: '14px', fontWeight: 900, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
                CONFIDENTIAL - 이동현 팀장 (2026-07-24)
              </div>
              <h4 style={{ fontSize: '12px', textDecoration: 'underline', marginBottom: '8px' }}>[신청서] 2026 3분기 재무 보고서</h4>
              <p>본 문서는 경영지원실 엄격 보안 서식입니다.</p>
              <p style={{ marginTop: '6px' }}>총 발행 수량: 10부 / 결재자: 이동현 팀장</p>
              <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: '#000', color: '#fff', fontSize: '8px', padding: '2px 4px', fontFamily: 'monospace' }}>
                |||| || ||| || | CMS-88192
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', background: '#0284c7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}
          >
            대조 검증 완료
          </button>
        </div>
      </div>
    </div>
  )
}
