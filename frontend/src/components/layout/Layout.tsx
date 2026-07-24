import React from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MobileHeader />
      <Navbar />
      <div className="app-body" style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main className="app-main" style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>{children}</main>
      </div>
    </div>
  )
}
