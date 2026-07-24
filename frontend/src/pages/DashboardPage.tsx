import React from 'react'
import { mockKpiData, mockPrintRequests, mockPrinters, fetchDashboardKpisApi, approvePrintRequestApi, rejectPrintRequestApi } from '../services/api'
import { EsgAnalyticsSection } from '../components/EsgAnalyticsSection'
import { SecurityReportChartSection } from '../components/SecurityReportChartSection'
import { useTranslation } from '../hooks/useTranslation'
import { Link } from 'react-router-dom'
import { FileText, Clock, PrinterCheck, TrendingDown, CheckCircle, XCircle } from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation()
  const [kpiData, setKpiData] = React.useState(mockKpiData)
  const [requests, setRequests] = React.useState(mockPrintRequests)
  const [message, setMessage] = React.useState<string | null>(null)
  const kpiCards = [
    {
      label: '총 인쇄 요청 수',
      value: kpiData.totalRequests.toLocaleString(),
      unit: '건',
      icon: FileText,
      accent: '#38bdf8',
    },
    {
      label: '승인 대기 건수',
      value: kpiData.pendingApprovals.toLocaleString(),
      unit: '건',
      icon: Clock,
      accent: '#f59e0b',
    },
    {
      label: '가동 중 프린터',
      value: `${kpiData.activePrinters} / ${kpiData.totalPrinters}`,
      unit: '대',
      icon: PrinterCheck,
      accent: '#10b981',
    },
    {
      label: '종이·비용 절감률',
      value: `${kpiData.paperSavingsPercent}`,
      unit: '%',
      icon: TrendingDown,
      accent: '#a78bfa',
    },
  ]

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
      <div className="page-header dashboard-heading">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>{t('dashboard_title')}</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>{t('dashboard_sub')}</p>
        </div>
        <span className="dashboard-live-indicator"><span aria-hidden="true" /> 운영 현황</span>
        {message && <p className="status-message" style={{ color: '#38bdf8', fontSize: '13px', marginTop: '4px', whiteSpace: 'nowrap' }}>{message}</p>}
      </div>

      {/* KPI Cards Row */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {kpiCards.map(({ label, value, unit, icon: Icon, accent }) => (
          <article
            className="glass-card dashboard-kpi-card"
            key={label}
            style={{ '--kpi-accent': accent } as React.CSSProperties}
          >
            <div className="dashboard-kpi-label">
              <span>{label}</span>
              <span className="dashboard-kpi-icon"><Icon size={19} /></span>
            </div>
            <div className="dashboard-kpi-value">
              {value} <span>{unit}</span>
            </div>
          </article>
        ))}
      </div>

      {/* ESG Green Print Analytics Section */}
      <EsgAnalyticsSection />

      {/* Main Grid Content */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Left: Print Approval Queue */}
        <div className="glass-card table-card dashboard-panel">
          <div className="dashboard-section-header">
            <div>
              <h3>최근 인쇄 결재 대기 큐</h3>
              <p>승인 또는 반려가 필요한 최근 요청입니다.</p>
            </div>
            <Link to="/requests">전체 보기 <span aria-hidden="true">→</span></Link>
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
        <div className="glass-card dashboard-panel">
          <div className="dashboard-section-header">
            <div>
              <h3>프린터 Fleet 상태</h3>
              <p>장비 연결 및 소모품 현황입니다.</p>
            </div>
            <Link to="/printers">전체 보기 <span aria-hidden="true">→</span></Link>
          </div>
          <div className="dashboard-printer-list">
            {mockPrinters.map((prt) => (
              <div className="dashboard-printer-item" key={prt.id}>
                <div className="dashboard-printer-heading">
                  <span title={prt.name}>{prt.name}</span>
                  <span className={`badge badge-${prt.status.toLowerCase()}`} style={{ whiteSpace: 'nowrap' }}>{prt.status}</span>
                </div>
                <div className="dashboard-printer-meta">IP {prt.ipAddress} · {prt.location}</div>
                <div className="dashboard-toner">
                  <div>
                    <span>토너 잔량</span>
                    <span>{prt.blackTonerLevel}%</span>
                  </div>
                  <div className="dashboard-progress">
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
