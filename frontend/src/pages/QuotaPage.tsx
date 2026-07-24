import React, { useState } from 'react'
import { QuotaRequestModal } from '../components/QuotaRequestModal'
import { useTranslation } from '../hooks/useTranslation'
import { PieChart, Plus, Users, ShieldAlert, Award } from 'lucide-react'

export const QuotaPage: React.FC = () => {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const quotas = [
    { id: 1, name: '이동현 팀장', dept: '기술개발본부', limit: 1000, used: 480, status: 'NORMAL' },
    { id: 2, name: '김철수 차장', dept: '경영기획팀', limit: 500, used: 495, status: 'WARNING' },
    { id: 3, name: '박영희 수석', dept: '보안인프라팀', limit: 800, used: 310, status: 'NORMAL' },
    { id: 4, name: '최민수 사원', dept: '마케팅팀', limit: 300, used: 300, status: 'EXHAUSTED' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700 }}>월간 인쇄 쿼터 및 사용량 통제</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>부서 및 임직원별 월간 최대 인쇄 가능 매수 관리</p>
          {message && <p style={{ color: '#38bdf8', fontSize: '13px', marginTop: '4px' }}>{message}</p>}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-md btn-primary"
        >
          <Plus size={16} /> 🚀 쿼터 추가 한도 신청
        </button>
      </div>

      <QuotaRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(msg) => setMessage(msg)}
      />

      <div className="glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>사용자 / 부서</th>
              <th>월간 한도</th>
              <th>현재 사용량</th>
              <th>잔여 쿼터</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {quotas.map((q) => {
              const remaining = q.limit - q.used
              const percent = Math.round((q.used / q.limit) * 100)
              return (
                <tr key={q.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div>{q.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{q.dept}</div>
                  </td>
                  <td>{q.limit}장</td>
                  <td>{q.used}장 ({percent}%)</td>
                  <td style={{ color: remaining <= 20 ? '#ef4444' : '#34d399', fontWeight: 700 }}>{remaining}장</td>
                  <td>
                    <span className={`badge badge-${q.status === 'EXHAUSTED' ? 'rejected' : q.status === 'WARNING' ? 'pending' : 'approved'}`}>
                      {q.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
