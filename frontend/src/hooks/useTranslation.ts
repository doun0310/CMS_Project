import { useState, useEffect } from 'react'
import { translations, Language } from '../i18n/translations'

const LISTENERS = new Set<() => void>()

export function setGlobalLanguage(lang: Language) {
  localStorage.setItem('cms_lang', lang)
  document.documentElement.lang = lang.toLowerCase()
  LISTENERS.forEach((listener) => listener())
}

export function useTranslation() {
  const [lang, setLang] = useState<Language>(
    () => (localStorage.getItem('cms_lang') as Language) || 'KO'
  )

  useEffect(() => {
    const handleUpdate = () => {
      const current = (localStorage.getItem('cms_lang') as Language) || 'KO'
      setLang(current)
    }
    LISTENERS.add(handleUpdate)
    return () => {
      LISTENERS.delete(handleUpdate)
    }
  }, [])

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['KO']?.[key] || key
  }

  return { t, lang, setLanguage: setGlobalLanguage }
}
