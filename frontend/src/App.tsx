import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { PrintRequestsPage } from './pages/PrintRequestsPage'
import { PrintersPage } from './pages/PrintersPage'
import { AuditLogsPage } from './pages/AuditLogsPage'
import { PoliciesPage } from './pages/PoliciesPage'

export const App: React.FC = () => {
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
    </BrowserRouter>
  )
}
