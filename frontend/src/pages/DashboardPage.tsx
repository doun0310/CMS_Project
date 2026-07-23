import React from 'react'
import { mockKpiData, mockPrintRequests, mockPrinters } from '../services/api'
import { FileText, Clock, PrinterCheck, TrendingDown, CheckCircle, XCircle } from 'lucide-react'

export const DashboardPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>대시보드 개요</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>사내 인쇄 요청 결재 및 프린터 장비 실시간 운영 현황</p>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '13px' }}>
            <span>총 인쇄 요청 수</span>
            <FileText size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#f8fafc' }}>
            {mockKpiData.totalRequests.toLocaleString()} <span style={{ fontSize: '14px', color: '#10b981' }}>건</span>
          </div>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '13px' }}>
            <span>승인 대기 건수</span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#fbbf24' }}>
            {mockKpiData.pendingApprovals} <span style={{ fontSize: '14px', color: '#94a3b8' }}>건</span>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '13px' }}>
            <span>가동 중 프린터</span>
            <PrinterCheck size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#34d399' }}>
            {mockKpiData.activePrinters} / {mockKpiData.totalPrinters} <span style={{ fontSize: '14px', color: '#94a3b8' }}>대</span>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '13px' }}>
            <span>종이/비용 절감률</span>
            <TrendingDown size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#38bdf8' }}>
            {mockKpiData.paperSavingsPercent}%
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Left: Print Approval Queue */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>최근 인쇄 결재 대기 큐</h3>
            <span style={{ fontSize: '12px', color: '#38bdf8', cursor: 'pointer' }}>전체 보기 &rarr;</span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>문서명</th>
                <th>요청자 / 부서</th>
                <th>보안 등급</th>
                <th>상태</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {mockPrintRequests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{req.documentName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{req.pageCount}페이지 × {req.copyCount}부</div>
                  </td>
                  <td>
                    <div>{req.requesterName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{req.requesterDepartment}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: req.securityLevel === 'CONFIDENTIAL' ? '#f87171' : '#94a3b8' }}>
                      {req.securityLevel}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button style={{ padding: '4px 8px', background: '#10b981', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <CheckCircle size={12} /> 승인
                        </button>
                        <button style={{ padding: '4px 8px', background: '#ef4444', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <XCircle size={12} /> 반려
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#64748b' }}>완료됨</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Printer Fleet Health Status */}
        <div className="glass-card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>프린터 Fleet 상태</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mockPrinters.map((prt) => (
              <div key={prt.id} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{prt.name}</span>
                  <span className={`badge badge-${prt.status.toLowerCase()}`}>{prt.status}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>IP: {prt.ipAddress} ({prt.location})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1' }}>
                    <span>토너 잔량</span>
                    <span>{prt.blackTonerLevel}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${prt.blackTonerLevel}%`, height: '100%', background: prt.blackTonerLevel <= 20 ? '#ef4444' : '#10b981' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
