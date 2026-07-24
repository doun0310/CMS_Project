import React from 'react'
import { ShieldCheck, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react'

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
    <div className="glass-card" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 color="#38bdf8" size={20} />
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>부서별 인쇄 보안 준수율 & PII 감지 트렌드 분석</h3>
        </div>
        <span style={{ fontSize: '12px', color: '#94a3b8', background: 'rgba(15, 23, 42, 0.6)', padding: '4px 10px', borderRadius: '12px', border: '1px solid #334155' }}>
          ⚡ 실시간 통계 분석 엔진 동작 중
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Department Compliance List */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
          <h4 style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>🏢 주요 부서별 보안 승인 준수율</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {deptMetrics.map((item) => (
              <div key={item.dept} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{item.dept}</span>
                  <span style={{ color: item.complianceRate >= 95 ? '#34d399' : '#fbbf24', fontWeight: 700 }}>
                    {item.complianceRate}% 준수 ({item.piiCount}건 PII 탐지)
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
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
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '10px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h4 style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>📈 주간 인쇄 요청 & PII 탐지 트렌드</h4>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', padding: '0 10px' }}>
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
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{wt.day}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', background: '#0284c7', borderRadius: '2px' }}></span> 인쇄 승인 요청</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '2px' }}></span> PII 탐지 건수</span>
          </div>
        </div>
      </div>
    </div>
  )
}
