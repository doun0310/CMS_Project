import React from 'react'
import { BarChart3 } from 'lucide-react'

export const SecurityReportChartSection: React.FC = () => {
  const deptMetrics = [
    { dept: '재무회계팀', complianceRate: 100, piiCount: 4, status: 'EXCELLENT' },
    { dept: '경영지원실', complianceRate: 98, piiCount: 2, status: 'EXCELLENT' },
    { dept: 'R&D 연구센터', complianceRate: 94, piiCount: 7, status: 'GOOD' },
    { dept: '글로벌 영업본부', complianceRate: 89, piiCount: 12, status: 'WARNING' },
  ]

  const weeklyTrend = [
    { day: '월', requests: 120, piiDetected: 3 },
    { day: '화', requests: 145, piiDetected: 5 },
    { day: '수', requests: 160, piiDetected: 2 },
    { day: '목', requests: 190, piiDetected: 8 },
    { day: '금', requests: 210, piiDetected: 6 },
  ]

  return (
    <section className="glass-card dashboard-security-section">
      <div className="dashboard-section-header dashboard-security-header">
        <div className="dashboard-block-title">
          <span className="dashboard-block-title-icon"><BarChart3 size={20} /></span>
          <div>
            <h3>인쇄 보안 준수 및 PII 감지 추이</h3>
            <p>부서별 준수율과 최근 5일간 탐지 현황입니다.</p>
          </div>
        </div>
        <span className="dashboard-engine-status">
          <span aria-hidden="true" /> 실시간 분석 중
        </span>
      </div>

      <div className="dashboard-security-grid">
        {/* Department Compliance List */}
        <div className="dashboard-chart-card">
          <h4>주요 부서별 보안 승인 준수율</h4>
          <div className="dashboard-compliance-list">
            {deptMetrics.map((item) => (
              <div className="dashboard-compliance-item" key={item.dept}>
                <div>
                  <span>{item.dept}</span>
                  <strong style={{ color: item.complianceRate >= 95 ? '#34d399' : '#fbbf24' }}>
                    {item.complianceRate}% 준수 ({item.piiCount}건 PII 탐지)
                  </strong>
                </div>
                <div className="dashboard-progress">
                  <div style={{
                    width: `${item.complianceRate}%`,
                    height: '100%',
                    background: item.complianceRate >= 95 ? '#10b981' : '#f59e0b',
                    borderRadius: '3px',
                    transition: 'width 0.5s'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Trend Bar Simulation */}
        <div className="dashboard-chart-card dashboard-trend-card">
          <h4>주간 인쇄 요청·PII 탐지 추이</h4>
          <div className="dashboard-weekly-bars">
            {weeklyTrend.map((wt) => (
              <div key={wt.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px' }}>
                  {/* Requests Bar */}
                  <div
                    style={{ width: '14px', height: `${(wt.requests / 220) * 100}%`, background: '#0284c7', borderRadius: '2px 2px 0 0' }}
                    title={`총 인쇄 ${wt.requests}건`}
                  />
                  {/* PII Bar */}
                  <div
                    style={{ width: '14px', height: `${(wt.piiDetected / 10) * 100}%`, background: '#ef4444', borderRadius: '2px 2px 0 0' }}
                    title={`PII 탐지 ${wt.piiDetected}건`}
                  />
                </div>
                <span>{wt.day}</span>
              </div>
            ))}
          </div>
          <div className="dashboard-chart-legend">
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', background: '#0284c7', borderRadius: '2px' }}></span> 인쇄 승인 요청</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '2px' }}></span> PII 탐지 건수</span>
          </div>
        </div>
      </div>
    </section>
  )
}
