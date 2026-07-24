import React from 'react'
import { Leaf, DollarSign, FileText, Trees } from 'lucide-react'

export const EsgAnalyticsSection: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Leaf color="#10b981" size={22} />
        <h3 style={{ fontSize: '18px', fontWeight: 700, whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>ESG 친환경 인쇄 절감 및 CO2 감축 통계</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={22} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>누적 불필요 인쇄 절감 매수</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap' }}>128,450 장</div>
            <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px', whiteSpace: 'nowrap' }}>전월 대비 +14.2% 절감</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DollarSign size={22} color="#38bdf8" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>용지/토너 소모품 절감 비용</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#38bdf8', whiteSpace: 'nowrap' }}>₩ 4,850,000 원</div>
            <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '2px', whiteSpace: 'nowrap' }}>예산 절감 효과 증대</div>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Trees size={22} color="#f59e0b" />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>보호한 30년생 소나무 및 CO2</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b', whiteSpace: 'nowrap' }}>15.4 그루 / 640kg CO2</div>
            <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '2px', whiteSpace: 'nowrap' }}>탄소 중립 달성 기여</div>
          </div>
        </div>
      </div>
    </div>
  )
}
