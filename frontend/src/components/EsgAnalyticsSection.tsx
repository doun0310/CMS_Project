import React from 'react'
import { Leaf, DollarSign, FileText, Trees } from 'lucide-react'

export const EsgAnalyticsSection: React.FC = () => {
  return (
    <section className="dashboard-esg-section">
      <div className="dashboard-block-title">
        <span className="dashboard-block-title-icon dashboard-block-title-icon-success"><Leaf size={20} /></span>
        <div>
          <h3>ESG 친환경 인쇄 성과</h3>
          <p>용지·소모품 절감과 탄소 감축 누적 통계입니다.</p>
        </div>
      </div>

      <div className="dashboard-esg-grid">
        <article className="glass-card dashboard-esg-card">
          <div className="dashboard-esg-icon" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
            <FileText size={22} color="#10b981" />
          </div>
          <div className="dashboard-esg-copy">
            <div>누적 불필요 인쇄 절감</div>
            <strong>128,450 <small>장</small></strong>
            <span style={{ color: '#34d399' }}>전월 대비 +14.2%</span>
          </div>
        </article>

        <article className="glass-card dashboard-esg-card">
          <div className="dashboard-esg-icon" style={{ background: 'rgba(56, 189, 248, 0.15)' }}>
            <DollarSign size={22} color="#38bdf8" />
          </div>
          <div className="dashboard-esg-copy">
            <div>용지·토너 절감 비용</div>
            <strong>₩4,850,000</strong>
            <span style={{ color: '#7dd3fc' }}>예산 절감 효과 증대</span>
          </div>
        </article>

        <article className="glass-card dashboard-esg-card">
          <div className="dashboard-esg-icon" style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
            <Trees size={22} color="#f59e0b" />
          </div>
          <div className="dashboard-esg-copy">
            <div>소나무 보호·CO₂ 감축</div>
            <strong>15.4 <small>그루</small> · 640 <small>kg</small></strong>
            <span style={{ color: '#fbbf24' }}>탄소 중립 달성 기여</span>
          </div>
        </article>
      </div>
    </section>
  )
}
