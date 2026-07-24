import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X, Printer, LayoutDashboard, FileCheck, ShieldAlert, Settings, PieChart, FileCode } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

export const MobileHeader: React.FC = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

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
    <div className="mobile-header-bar" style={{ display: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Printer size={20} color="#38bdf8" />
          <span style={{ fontWeight: 700, fontSize: '15px' }}>CMS Print Hub</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{ background: 'none', border: 'none', color: '#f8fafc', cursor: 'pointer' }}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <div style={{ background: '#0f172a', borderBottom: '1px solid #334155', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: isActive ? '#38bdf8' : '#cbd5e1',
                  background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                })}
              >
                <Icon size={16} />
                {item.label}
              </NavLink>
            )
          })}
        </div>
      )}
    </div>
  )
}
