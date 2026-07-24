import React, { useState } from 'react'
import { X, Globe, Check, Shield } from 'lucide-react'
import { setGlobalLanguage } from '../hooks/useTranslation'
import { Language } from '../i18n/translations'

interface Props {
  isOpen: boolean
  onClose: () => void
  onLanguageChange: (lang: string) => void
}

export const I18nLanguageModal: React.FC<Props> = ({ isOpen, onClose, onLanguageChange }) => {
  const [selectedLang, setSelectedLang] = useState<Language>(() => (localStorage.getItem('cms_lang') as Language) || 'KO')

  if (!isOpen) return null

  const handleSave = () => {
    setGlobalLanguage(selectedLang)
    onLanguageChange(selectedLang)
    onClose()
  }

  const languages = [
    { code: 'KO', name: '한국어 (Korean)', desc: '대한민국 본사 시스템 기본 언어' },
    { code: 'EN', name: 'English (US)', desc: 'Global Branch HQ Standard Language' },
    { code: 'JA', name: '日本語 (Japanese)', desc: '東京支社 専用インターフェース' },
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
          <Globe color="#38bdf8" size={24} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>글로벌 다국어 (i18n) & 접근성 설정</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>임직원 언어 환경 및 웹 접근성(a11y) 선택</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => setSelectedLang(lang.code as Language)}
              style={{
                background: selectedLang === lang.code ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                border: selectedLang === lang.code ? '1px solid #38bdf8' : '1px solid #334155',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>{lang.name}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{lang.desc}</div>
              </div>
              {selectedLang === lang.code && <Check color="#38bdf8" size={18} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', background: '#334155', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            style={{ padding: '8px 16px', background: '#0284c7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}
          >
            언어 설정 적용
          </button>
        </div>
      </div>
    </div>
  )
}
