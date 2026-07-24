import React, { useState } from 'react'
import { X, ShieldCheck, Eye, Save } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (updatedWatermark: any) => void
}

export const WatermarkModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [watermarkText, setWatermarkText] = useState('[기밀문서] 무단 복제 금지 / EMP-3002 / 10.0.3.12')
  const [opacity, setOpacity] = useState(0.2)
  const [angle, setAngle] = useState(-35)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      onSuccess({ watermarkText, opacity, angle })
      setSubmitting(false)
      onClose()
    }, 600)
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
      <div className="glass-card" style={{ width: '680px', padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck color="#38bdf8" size={24} />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>출력물 동적 보안 워터마크 설정</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Left Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>워터마크 출력 문구</label>
              <input
                type="text"
                required
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>인쇄 지면 투명도 ({Math.round(opacity * 100)}%)</label>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>회전 각도 ({angle}도)</label>
              <input
                type="range"
                min="-60"
                max="60"
                step="5"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
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
                <Save size={14} /> {submitting ? '적용 중...' : '워터마크 적용'}
              </button>
            </div>
          </form>

          {/* Right Live Preview */}
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Eye size={14} color="#38bdf8" /> 인쇄 지면 미리보기 (Live Preview)
            </div>
            <div style={{
              width: '100%',
              height: '210px',
              background: '#ffffff',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
              padding: '16px'
            }}>
              <div style={{ fontSize: '10px', color: '#cbd5e1', lineHeight: 1.6 }}>
                <strong>[CONFIDENTIAL REPORT]</strong><br />
                This document is protected by CMS Print Hub security rules.<br />
                Unauthorized scanning or reproduction is strictly logged in audit trail.
              </div>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                transform: `rotate(${angle}deg)`,
                opacity: opacity,
                color: '#000000',
                fontWeight: 800,
                fontSize: '11px',
                textAlign: 'center',
                padding: '10px'
              }}>
                {watermarkText}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
