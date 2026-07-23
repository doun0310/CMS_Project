import React from 'react'
import { mockPrinters } from '../services/api'
import { RefreshCw, Plus } from 'lucide-react'

export const PrintersPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>프린터 Fleet 모니터링</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>사내 네트워크 프린터 장비 상태 및 SNMP 소모품 실시간 감지</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ padding: '8px 14px', background: '#334155', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#f8fafc', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} /> 전체 SNMP 동기화
          </button>
          <button style={{ padding: '8px 14px', background: '#0284c7', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> 신규 프린터 등록
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {mockPrinters.map((prt) => (
          <div key={prt.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{prt.name}</h3>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{prt.modelName}</div>
              </div>
              <span className={`badge badge-${prt.status.toLowerCase()}`}>{prt.status}</span>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>IP 주소:</span>
                <span>{prt.ipAddress}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>위치:</span>
                <span>{prt.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>현재 출력 작업:</span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>{prt.activeJobCount} 건</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>소모품 수집 상태</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>블랙 토너</span>
                  <span>{prt.blackTonerLevel}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${prt.blackTonerLevel}%`, height: '100%', background: prt.blackTonerLevel <= 20 ? '#ef4444' : '#10b981' }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
