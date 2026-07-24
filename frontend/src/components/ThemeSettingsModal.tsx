import React, { useState, useEffect } from 'react'
import { X, Palette, Sun, Moon, Sparkles, Check } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export const ThemeSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [selectedTheme, setSelectedTheme] = useState(() => localStorage.getItem('cms_theme') || 'GLASS_DARK')
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('cms_fontsize') || 'MEDIUM')
  const [enableBlur, setEnableBlur] = useState(() => localStorage.getItem('cms_blur') !== 'false')

  const applyThemeToDOM = (theme: string, fSize: string, blur: boolean) => {
    // 1. Theme Data Attribute
    document.documentElement.setAttribute('data-theme', theme)

    // 2. Font Size
    if (fSize === 'SMALL') {
      document.documentElement.style.fontSize = '13px'
    } else if (fSize === 'LARGE') {
      document.documentElement.style.fontSize = '16px'
    } else {
      document.documentElement.style.fontSize = '14px'
    }

    // 3. Blur
    if (!blur) {
      document.body.classList.add('no-blur')
    } else {
      document.body.classList.remove('no-blur')
    }
  }

  useEffect(() => {
    applyThemeToDOM(selectedTheme, fontSize, enableBlur)
  }, [])

  if (!isOpen) return null

  const handleSave = () => {
    applyThemeToDOM(selectedTheme, fontSize, enableBlur)
    localStorage.setItem('cms_theme', selectedTheme)
    localStorage.setItem('cms_fontsize', fontSize)
    localStorage.setItem('cms_blur', String(enableBlur))
    onClose()
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
      <div className="glass-card" style={{ width: '460px', padding: '24px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Palette color="#38bdf8" size={24} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>UI/UX 테마 및 스타일 설정</h3>
            <p style={{ color: '#94a3b8', fontSize: '12px' }}>대시보드 모던 CSS 테마 및 백드롭 가시성 커스텀</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>디자인 테마 선택</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                onClick={() => setSelectedTheme('GLASS_DARK')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: selectedTheme === 'GLASS_DARK' ? '2px solid #0284c7' : '1px solid #334155',
                  background: 'rgba(30, 41, 59, 0.8)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={16} color="#38bdf8" /> Glass Dark (기본)
              </button>

              <button
                onClick={() => setSelectedTheme('HIGH_CONTRAST')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: selectedTheme === 'HIGH_CONTRAST' ? '2px solid #0284c7' : '1px solid #334155',
                  background: '#000000',
                  color: '#fbbf24',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Moon size={16} color="#fbbf24" /> High Contrast
              </button>

              <button
                onClick={() => setSelectedTheme('SLATE_MINIMAL')}
                style={{
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: selectedTheme === 'SLATE_MINIMAL' ? '2px solid #0284c7' : '1px solid #334155',
                  background: '#1e293b',
                  color: '#f8fafc',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sun size={16} color="#94a3b8" /> Slate Minimal
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#e2e8f0', cursor: 'pointer' }}>
              <span>유리 모피즘 (Glassmorphism Blur) 효과</span>
              <input
                type="checkbox"
                checked={enableBlur}
                onChange={(e) => setEnableBlur(e.target.checked)}
              />
            </label>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#e2e8f0' }}>
              <span>기본 폰트 크기 설정</span>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                style={{ padding: '4px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: '4px', color: '#fff', fontSize: '12px' }}
              >
                <option value="SMALL">작게 (13px)</option>
                <option value="MEDIUM">표준 (14px)</option>
                <option value="LARGE">크게 (16px)</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={handleSave}
            style={{ padding: '8px 16px', background: '#0284c7', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            <Check size={14} /> 설정 저장
          </button>
        </div>
      </div>
    </div>
  )
}
