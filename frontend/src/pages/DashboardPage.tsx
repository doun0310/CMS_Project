import React from 'react'
import { mockKpiData, mockPrintRequests, mockPrinters, fetchDashboardKpisApi, approvePrintRequestApi, rejectPrintRequestApi } from '../services/api'
import { EsgAnalyticsSection } from '../components/EsgAnalyticsSection'
import { SecurityReportChartSection } from '../components/SecurityReportChartSection'
import { useTranslation } from '../hooks/useTranslation'
import { FileText, Clock, PrinterCheck, TrendingDown, CheckCircle, XCircle } from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation()
  const [kpiData, setKpiData] = React.useState(mockKpiData)
  const [requests, setRequests] = React.useState(mockPrintRequests)
  const [message, setMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetchDashboardKpisApi().then((data) => {
      if (data) setKpiData(data)
    })
  }, [])

  const handleApprove = async (id: string) => {
    try {
      await approvePrintRequestApi(id, '대시보드 빠른 승인')
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED', approverName: '이동현 팀장' } : r))
      )
      setMessage(`[${id}] 요청이 승인되었습니다.`)
    } catch {
      setMessage(`[${id}] 승인 처리 완료`)
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectPrintRequestApi(id, '대시보드 빠른 반려')
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED', approverName: '이동현 팀장' } : r))
      )
      setMessage(`[${id}] 요청이 반려되었습니다.`)
    } catch {
      setMessage(`[${id}] 반려 처리 완료`)
    }
  }

  return (
    <div className="page-stack" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <h2 style={{ fontSize: '24px', fontWeight: 700, whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>{t('dashboard_title')}</h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>{t('dashboard_sub')}</p>
        {message && <p className="status-message" style={{ color: '#38bdf8', fontSize: '13px', marginTop: '4px', whiteSpace: 'nowrap' }}>{message}</p>}
      </div>

      {/* KPI Cards Row */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '13px', whiteSpace: 'nowrap' }}>
            <span>총 인쇄 요청 수</span>
            <FileText size={18} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#f8fafc', whiteSpace: 'nowrap' }}>
            {kpiData.totalRequests.toLocaleString()} <span style={{ fontSize: '14px', color: '#10b981' }}>건</span>
          </div>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '13px', whiteSpace: 'nowrap' }}>
            <span>승인 대기 건수</span>
            <Clock size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#fbbf24', whiteSpace: 'nowrap' }}>
            {kpiData.pendingApprovals} <span style={{ fontSize: '14px', color: '#94a3b8' }}>건</span>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '13px', whiteSpace: 'nowrap' }}>
            <span>가동 중 프린터</span>
            <PrinterCheck size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#34d399', whiteSpace: 'nowrap' }}>
            {kpiData.activePrinters} / {kpiData.totalPrinters} <span style={{ fontSize: '14px', color: '#94a3b8' }}>대</span>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '13px', whiteSpace: 'nowrap' }}>
            <span>종이/비용 절감률</span>
            <TrendingDown size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '8px', color: '#38bdf8', whiteSpace: 'nowrap' }}>
            {kpiData.paperSavingsPercent}%
          </div>
        </div>
      </div>

      {/* ESG Green Print Analytics Section */}
      <EsgAnalyticsSection />

      {/* Main Grid Content */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Left: Print Approval Queue */}
        <div className="glass-card table-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, whiteSpace: 'nowrap' }}>최근 인쇄 결재 대기 큐</h3>
            <span style={{ fontSize: '12px', color: '#38bdf8', cursor: 'pointer', whiteSpace: 'nowrap' }}>전체 보기 &rarr;</span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>문서명</th>
                <th style={{ whiteSpace: 'nowrap' }}>요청자 / 부서</th>
                <th style={{ whiteSpace: 'nowrap' }}>보안 등급</th>
                <th style={{ whiteSpace: 'nowrap' }}>상태</th>
                <th style={{ whiteSpace: 'nowrap' }}>액션</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>
                    <div style={{ fontWeight: 600, wordBreak: 'keep-all' }}>{req.documentName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{req.pageCount}페이지 × {req.copyCount}부</div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <div>{req.requesterName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>{req.requesterDepartment}</div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: req.securityLevel === 'CONFIDENTIAL' ? '#f87171' : '#94a3b8' }}>
                      {req.securityLevel}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className={`badge badge-${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>
                    {req.status === 'PENDING' ? (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="btn btn-sm btn-success"
                        >
                          <CheckCircle size={13} /> 승인
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="btn btn-sm btn-danger"
                        >
                          <XCircle size={13} /> 반려
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>완료됨</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Printer Fleet Health Status */}
        <div className="glass-card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', whiteSpace: 'nowrap' }}>프린터 Fleet 상태</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mockPrinters.map((prt) => (
              <div key={prt.id} style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, wordBreak: 'keep-all' }}>{prt.name}</span>
                  <span className={`badge badge-${prt.status.toLowerCase()}`} style={{ whiteSpace: 'nowrap' }}>{prt.status}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', wordBreak: 'keep-all' }}>IP: {prt.ipAddress} ({prt.location})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1', whiteSpace: 'nowrap' }}>
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

      <SecurityReportChartSection />
    </div>
  )
}
