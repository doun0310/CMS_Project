import React from 'react'
import { Printer, Bell, User } from 'lucide-react'

export const Navbar: React.FC = () => {
  return (
    <header
      style={{
        height: '64px',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Printer size={24} color="#38bdf8" />
        <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px' }}>
          CMS Print Hub <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 400 }}>Admin Portal</span>
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={20} color="#94a3b8" />
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            5
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} color="#f8fafc" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>이동현 팀장</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>기술개발본부 (승인권자)</div>
          </div>
        </div>
      </div>
    </header>
  )
}
