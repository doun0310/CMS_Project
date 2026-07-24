import React, { useState } from 'react'
import { X, HardDrive, Save, Lock } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: (statusMessage: string) => void
}

export const MediaControlModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [blockUsbPrint, setBlockUsbPrint] = useState(true)
  const [blockUsbScanSave, setBlockUsbScanSave] = useState(true)
  const [blockMobileAirPrint, setBlockMobileAirPrint] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      onSuccess('외장 USB 매체 및 이동식 장치 인쇄 통제 보안 규칙이 적용되었습니다.')
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
          <HardDrive color="#f59e0b" size={24} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>외장 매체 및 무선 인쇄 통제</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>USB 메모리, 모바일 AirPrint 및 외부 저장 매체 통제</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#e2e8f0', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={blockUsbPrint}
                onChange={(e) => setBlockUsbPrint(e.target.checked)}
              />
              <div>
                <strong style={{ color: '#fff' }}>USB 직접 인쇄 전면 차단</strong>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>프린터에 USB 연결 후 직접 출력 시도 시 차단</p>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#e2e8f0', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={blockUsbScanSave}
                onChange={(e) => setBlockUsbScanSave(e.target.checked)}
              />
              <div>
                <strong style={{ color: '#fff' }}>스캔 파일 USB 저장 차단</strong>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>복합기 스캔 후 USB 저장 금지 (사내 서버만 허용)</p>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#e2e8f0', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={blockMobileAirPrint}
                onChange={(e) => setBlockMobileAirPrint(e.target.checked)}
              />
              <div>
                <strong style={{ color: '#fff' }}>모바일 AirPrint / Wi-Fi Direct 차단</strong>
                <p style={{ fontSize: '11px', color: '#94a3b8' }}>비인가 스마트폰 무선 인쇄 접속 차단</p>
              </div>
            </label>
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
              style={{ padding: '8px 16px', background: '#f59e0b', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Save size={14} /> {submitting ? '저장 중...' : '매체 보안 통제 적용'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
