import React, { useState } from 'react'
import { AlertCircle, ShieldAlert, Sparkles, X } from 'lucide-react'

interface Props {
  documentName: string
  score: number
  riskFactors: string[]
}

export const AiRiskInspectorBadge: React.FC<Props> = ({ documentName, score, riskFactors }) => {
  const [showDetail, setShowDetail] = useState(false)

  const isHighRisk = score >= 85
  const isModerate = score >= 50 && score < 85

  const badgeColor = isHighRisk ? '#ef4444' : isModerate ? '#f59e0b' : '#10b981'
  const badgeBg = isHighRisk ? 'rgba(239, 68, 68, 0.15)' : isModerate ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'

  return (
    <>
      <button
        onClick={() => setShowDetail(true)}
        style={{
          background: badgeBg,
          border: `1px solid ${badgeColor}`,
          borderRadius: '4px',
          color: badgeColor,
          fontSize: '10px',
          fontWeight: 700,
          padding: '2px 6px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
        }}
        title="AI 유출 위험도 정밀 분석 결과 보기"
      >
        <Sparkles size={11} /> AI 위험도 {score}점 {isHighRisk && '⚠️'}
      </button>

      {showDetail && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '450px', padding: '20px', position: 'relative' }}>
            <button onClick={() => setShowDetail(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ShieldAlert color={badgeColor} size={22} />
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>AI 문서 유출 위험도 스코어 정밀 분석</h3>
                <p style={{ color: '#94a3b8', fontSize: '11px' }}>문서 본문 AI 자연어 처리 분석 리포트</p>
              </div>
            </div>

            <div style={{ background: '#0f172a', border: `1px solid ${badgeColor}`, padding: '14px', borderRadius: '8px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{documentName}</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: badgeColor }}>
                  {score} / 100점 [{isHighRisk ? 'HIGH RISK' : isModerate ? 'MODERATE' : 'SAFE'}]
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${score}%`, height: '100%', background: badgeColor, transition: 'width 0.5s' }} />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <h4 style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>📌 AI 탐지 위험 요인 (Risk Factors)</h4>
              <ul style={{ paddingLeft: '18px', color: '#e2e8f0', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {riskFactors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>

            <div style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(15, 23, 42, 0.5)', padding: '8px 10px', borderRadius: '6px' }}>
              💡 <strong>AI 권고 사항:</strong> {isHighRisk ? '본 문서는 85점 이상 고위험군으로 CISO 2차 최종 승인 후 워터마크 강제 주입 출력이 권장됩니다.' : '정상 안전 범위 내의 인쇄 신청 건입니다.'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button
                onClick={() => setShowDetail(false)}
                style={{ padding: '6px 14px', background: '#334155', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '12px', cursor: 'pointer' }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
