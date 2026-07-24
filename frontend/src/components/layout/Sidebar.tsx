import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileCheck, Printer, ShieldAlert, Settings, PieChart, FileCode } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

export const Sidebar: React.FC = () => {
  const { t } = useTranslation()

  const menuItems = [
    { path: '/', label: t('nav_dashboard'), icon: LayoutDashboard },
    { path: '/requests', label: t('nav_print_requests'), icon: FileCheck },
    { path: '/printers', label: t('nav_printers'), icon: Printer },
    { path: '/policies', label: t('nav_policies'), icon: Settings },
    { path: '/templates', label: t('nav_templates'), icon: FileCode },
    { path: '/quota', label: t('nav_quota'), icon: PieChart },
    { path: '/audit-logs', label: t('nav_audit_logs'), icon: ShieldAlert },
  ]

  return (
    <aside
      className="app-sidebar"
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
      <div className="sidebar-section-label" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', padding: '0 12px 8px 12px', letterSpacing: '0.08em' }}>
        메인 메뉴
      </div>
      {menuItems.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="sidebar-link"
            aria-label={item.label}
            title={item.label}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: isActive ? 700 : 600,
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
              border: isActive ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid transparent',
              transition: 'all 0.2s ease',
            })}
          >
            <Icon size={18} />
            <span className="sidebar-link-label">{item.label}</span>
          </NavLink>
        )
      })}
    </aside>
  )
}
