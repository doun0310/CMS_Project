import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { PrintRequestsPage } from './pages/PrintRequestsPage'
import { PrintersPage } from './pages/PrintersPage'
import { AuditLogsPage } from './pages/AuditLogsPage'
import { PoliciesPage } from './pages/PoliciesPage'
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal'

export const App: React.FC = () => {
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === '?') {
        setIsShortcutModalOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/requests" element={<PrintRequestsPage />} />
          <Route path="/printers" element={<PrintersPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/settings" element={<PoliciesPage />} />
        </Routes>
      </Layout>
      <KeyboardShortcutsModal
        isOpen={isShortcutModalOpen}
        onClose={() => setIsShortcutModalOpen(false)}
      />
    </BrowserRouter>
  )
}
