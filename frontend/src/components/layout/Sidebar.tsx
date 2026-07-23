import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileCheck, Printer, ShieldAlert, Settings } from 'lucide-react'

export const Sidebar: React.FC = () => {
  const menuItems = [
    { path: '/', label: '대시보드', icon: LayoutDashboard },
    { path: '/requests', label: '인쇄 승인 큐', icon: FileCheck },
    { path: '/printers', label: '프린터 Fleet 모니터링', icon: Printer },
    { path: '/audit-logs', label: '감사 및 이력 로그', icon: ShieldAlert },
    { path: '/settings', label: '승인/자동화 정책', icon: Settings },
  ]

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        borderRight: '1px solid var(--border-color)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: 'rgba(15, 23, 42, 0.4)',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '0 12px 8px 12px' }}>
        메인 메뉴
      </div>
      {menuItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: isActive ? '#38bdf8' : '#94a3b8',
              background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
              border: isActive ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid transparent',
              transition: 'all 0.2s ease',
            })}
          >
            <Icon size={18} />
            {item.label}
          </NavLink>
        )
      })}
    </aside>
  )
}
