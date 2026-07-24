import React from 'react'
import { X, Keyboard, Command } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const KeyboardShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const shortcuts = [
    { key: 'Alt + N', description: '신규 인쇄 승인 신청 모달 열기' },
    { key: 'Alt + P', description: '사내 프린터 층별 위치 지도 열기' },
    { key: 'Alt + A', description: '보안 감사 로그 리포트 인쇄/PDF 저장' },
    { key: 'Shift + ?', description: '키보드 단축키 도움말 안내 팝업' },
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
      <div className="glass-card" style={{ width: '450px', padding: '24px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Keyboard color="#38bdf8" size={24} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>시스템 키보드 핫키 단축키 안내</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>빠른 내비게이션 및 결재 승인 단축키</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {shortcuts.map((sc) => (
            <div key={sc.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '13px', color: '#e2e8f0' }}>{sc.description}</span>
              <kbd style={{ background: '#1e293b', border: '1px solid #475569', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', background: '#0284c7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
