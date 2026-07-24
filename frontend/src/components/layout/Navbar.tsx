import React, { useState } from 'react'
import { Printer, Bell, User, Palette, Globe } from 'lucide-react'
import { ThemeSettingsModal } from '../ThemeSettingsModal'
import { I18nLanguageModal } from '../I18nLanguageModal'
import { useTranslation } from '../../hooks/useTranslation'

export const Navbar: React.FC = () => {
  const { t, lang } = useTranslation()
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)
  const [isLangModalOpen, setIsLangModalOpen] = useState(false)

  return (
    <header
      className="app-navbar"
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
        <h1 style={{ fontSize: '19px', fontWeight: 750, letterSpacing: '-0.5px' }}>
          CMS Print Hub <span className="brand-subtitle" style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>Admin Portal</span>
        </h1>
      </div>

      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => setIsLangModalOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', minHeight: '36px', padding: '4px' }}
          title="글로벌 언어 설정"
        >
          <Globe size={19} color="var(--primary)" /> <span className="navbar-action-label">{lang}</span>
        </button>

        <button
          onClick={() => setIsThemeModalOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', minHeight: '36px', padding: '4px' }}
          title="UI 테마 설정"
        >
          <Palette size={19} color="var(--primary)" /> <span className="navbar-action-label">{t('theme_setting')}</span>
        </button>

        <button aria-label="알림 5개" title="알림" style={{ position: 'relative', cursor: 'pointer', background: 'none', border: 0, minWidth: '36px', minHeight: '36px', display: 'grid', placeItems: 'center' }}>
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
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} color="#f8fafc" />
          </div>
          <div className="navbar-user-copy">
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{t('user_name')}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t('user_dept')}</div>
          </div>
        </div>
      </div>

      <I18nLanguageModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        onLanguageChange={() => {}}
      />

      <ThemeSettingsModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </header>
  )
}
