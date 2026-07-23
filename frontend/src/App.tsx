import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { PrintRequestsPage } from './pages/PrintRequestsPage'
import { PrintersPage } from './pages/PrintersPage'
import { AuditLogsPage } from './pages/AuditLogsPage'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/requests" element={<PrintRequestsPage />} />
          <Route path="/printers" element={<PrintersPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/settings" element={<div style={{ padding: 20 }}>⚙️ 승인 및 자동화 정책 설정 화면</div>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
