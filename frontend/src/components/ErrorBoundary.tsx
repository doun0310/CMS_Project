import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in CMS Print Hub App:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '32px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>⚠️ 시스템 안전 복구 모드</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
              예기치 않은 런타임 오류가 발생하였으나 시스템 보호망에 의해 안전하게 격리되었습니다.
            </p>
            
            {this.state.error && (
              <div style={{ background: '#050505', border: '1px solid #334155', borderRadius: '8px', padding: '12px', fontSize: '11px', color: '#f87171', fontFamily: 'monospace', marginBottom: '20px', textAlign: 'left', wordBreak: 'break-all' }}>
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{ padding: '10px 18px', background: '#334155', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <RefreshCw size={14} /> 화면 새로고침
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{ padding: '10px 18px', background: '#0284c7', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              >
                <Home size={14} /> 대시보드 복구
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
